import { Request, Response, NextFunction } from 'express';

const USER_NAME_MAX = 50;
const MOBILE_MAX = 15;
const EMAIL_MAX = 100;

const USER_NAME_REGEX = /^[a-zA-Z\s\-']+$/;
const MOBILE_REGEX = /^\+?[0-9\s\-]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_GENDERS = ['male', 'female'];

export function validateCreateUser(req: Request, res: Response, next: NextFunction): void {
    const { user_name, mobile_number, email, gender } = req.body;
    const errors: string[] = [];

    // user_name — required
    if (!user_name || typeof user_name !== 'string') {
        errors.push('user_name is required and must be a string');
    } else {
        const trimmed = user_name.trim();
        if (trimmed.length === 0) {
            errors.push('user_name cannot be empty');
        } else if (trimmed.length > USER_NAME_MAX) {
            errors.push(`user_name must be at most ${USER_NAME_MAX} characters`);
        } else if (!USER_NAME_REGEX.test(trimmed)) {
            errors.push('user_name can only contain letters, spaces, hyphens, and apostrophes');
        }
    }

    // mobile_number — required, unique validated at DB level
    if (!mobile_number || typeof mobile_number !== 'string') {
        errors.push('mobile_number is required and must be a string');
    } else {
        const trimmed = mobile_number.trim();
        if (trimmed.length === 0) {
            errors.push('mobile_number cannot be empty');
        } else if (trimmed.length > MOBILE_MAX) {
            errors.push(`mobile_number must be at most ${MOBILE_MAX} characters`);
        } else if (!MOBILE_REGEX.test(trimmed)) {
            errors.push('mobile_number must be a valid phone number');
        }
    }

    // email — optional
    if (email !== undefined && email !== null && email !== '') {
        if (typeof email !== 'string') {
            errors.push('email must be a string');
        } else {
            const trimmed = email.trim();
            if (trimmed.length > EMAIL_MAX) {
                errors.push(`email must be at most ${EMAIL_MAX} characters`);
            } else if (!EMAIL_REGEX.test(trimmed)) {
                errors.push('email must be a valid email address');
            }
        }
    }

    // gender — optional, enum
    if (gender !== undefined && gender !== null && gender !== '') {
        if (typeof gender !== 'string') {
            errors.push('gender must be a string');
        } else if (!VALID_GENDERS.includes(gender.toLowerCase())) {
            errors.push('gender must be either "male" or "female"');
        }
    }

    if (errors.length > 0) {
        // Clean up uploaded file on validation failure
        if (req.file) {
            const fs = require('fs');
            fs.unlink(req.file.path, () => { });
        }
        res.status(400).json({ success: false, errors });
        return;
    }

    // Sanitize
    req.body.user_name = user_name.trim();
    req.body.mobile_number = mobile_number.trim();
    if (email) req.body.email = email.trim();
    if (gender) req.body.gender = gender.toLowerCase();

    next();
}

export function validateUpdateUser(req: Request, res: Response, next: NextFunction): void {
    const { user_name, mobile_number, email, gender } = req.body;
    const errors: string[] = [];
    const hasFile = !!req.file;

    // At least one field or file must be provided
    if (user_name === undefined && mobile_number === undefined && email === undefined && gender === undefined && !hasFile) {
        errors.push('At least one field must be provided for update');
    }

    // user_name — optional
    if (user_name !== undefined) {
        if (typeof user_name !== 'string') {
            errors.push('user_name must be a string');
        } else {
            const trimmed = user_name.trim();
            if (trimmed.length === 0) {
                errors.push('user_name cannot be empty');
            } else if (trimmed.length > USER_NAME_MAX) {
                errors.push(`user_name must be at most ${USER_NAME_MAX} characters`);
            } else if (!USER_NAME_REGEX.test(trimmed)) {
                errors.push('user_name can only contain letters, spaces, hyphens, and apostrophes');
            }
        }
    }

    // mobile_number — optional
    if (mobile_number !== undefined) {
        if (typeof mobile_number !== 'string') {
            errors.push('mobile_number must be a string');
        } else {
            const trimmed = mobile_number.trim();
            if (trimmed.length === 0) {
                errors.push('mobile_number cannot be empty');
            } else if (trimmed.length > MOBILE_MAX) {
                errors.push(`mobile_number must be at most ${MOBILE_MAX} characters`);
            } else if (!MOBILE_REGEX.test(trimmed)) {
                errors.push('mobile_number must be a valid phone number');
            }
        }
    }

    // email — optional
    if (email !== undefined && email !== null && email !== '') {
        if (typeof email !== 'string') {
            errors.push('email must be a string');
        } else {
            const trimmed = email.trim();
            if (trimmed.length > EMAIL_MAX) {
                errors.push(`email must be at most ${EMAIL_MAX} characters`);
            } else if (!EMAIL_REGEX.test(trimmed)) {
                errors.push('email must be a valid email address');
            }
        }
    }

    // gender — optional, enum
    if (gender !== undefined && gender !== null && gender !== '') {
        if (typeof gender !== 'string') {
            errors.push('gender must be a string');
        } else if (!VALID_GENDERS.includes(gender.toLowerCase())) {
            errors.push('gender must be either "male" or "female"');
        }
    }

    if (errors.length > 0) {
        if (req.file) {
            const fs = require('fs');
            fs.unlink(req.file.path, () => { });
        }
        res.status(400).json({ success: false, errors });
        return;
    }

    // Sanitize
    if (user_name) req.body.user_name = user_name.trim();
    if (mobile_number) req.body.mobile_number = mobile_number.trim();
    if (email) req.body.email = email.trim();
    if (gender) req.body.gender = gender.toLowerCase();

    next();
}
