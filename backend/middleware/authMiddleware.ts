import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/userModel';
import { User } from '../models/userModel';

export interface AuthRequest extends Request {
    user?: User;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let token;

    // First try obtaining token from cookie
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // Fallback to Bearer token if not in cookie (e.g., mobile apps)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401).json({ success: false, errors: ['Not authorized, no token'] });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

        const user = await UserModel.getById(decoded.id);

        if (!user) {
            res.status(401).json({ success: false, errors: ['User not found'] });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, errors: ['Not authorized, token failed'] });
    }
};
