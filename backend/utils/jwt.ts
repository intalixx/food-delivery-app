import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
    });
};

export const setAuthCookie = (res: Response, token: string): void => {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
};

export const clearAuthCookie = (res: Response): void => {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        expires: new Date(0), // Expire immediately
    });
};
