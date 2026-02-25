import { Request, Response, NextFunction } from 'express';

const CATEGORY_NAME_MAX = 50;
const CATEGORY_NAME_REGEX = /^[a-zA-Z0-9\s\-&']+$/;

export function validateCreateCategory(req: Request, res: Response, next: NextFunction): void {
    const { category_name } = req.body;
    const errors: string[] = [];

    if (!category_name || typeof category_name !== 'string') {
        errors.push('category_name is required and must be a string');
    } else {
        const trimmed = category_name.trim();
        if (trimmed.length === 0) {
            errors.push('category_name cannot be empty');
        } else if (trimmed.length > CATEGORY_NAME_MAX) {
            errors.push(`category_name must be at most ${CATEGORY_NAME_MAX} characters`);
        } else if (!CATEGORY_NAME_REGEX.test(trimmed)) {
            errors.push('category_name can only contain letters, numbers, spaces, hyphens, ampersands, and apostrophes');
        }
    }

    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }

    req.body.category_name = category_name.trim();
    next();
}

export function validateUpdateCategory(req: Request, res: Response, next: NextFunction): void {
    const { category_name } = req.body;
    const errors: string[] = [];

    if (category_name === undefined) {
        errors.push('category_name is required');
    } else if (typeof category_name !== 'string') {
        errors.push('category_name must be a string');
    } else {
        const trimmed = category_name.trim();
        if (trimmed.length === 0) {
            errors.push('category_name cannot be empty');
        } else if (trimmed.length > CATEGORY_NAME_MAX) {
            errors.push(`category_name must be at most ${CATEGORY_NAME_MAX} characters`);
        } else if (!CATEGORY_NAME_REGEX.test(trimmed)) {
            errors.push('category_name can only contain letters, numbers, spaces, hyphens, ampersands, and apostrophes');
        }
    }

    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }

    req.body.category_name = category_name.trim();
    next();
}
