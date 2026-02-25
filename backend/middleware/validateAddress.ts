import { Request, Response, NextFunction } from 'express';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PINCODE_REGEX = /^[0-9]{6}$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

export function validateCreateAddress(req: Request, res: Response, next: NextFunction): void {
    const { user_id, save_as, pincode, city, state, house_number, street_locality, mobile } = req.body;
    const errors: string[] = [];

    // user_id — required
    if (!user_id || typeof user_id !== 'string') {
        errors.push('user_id is required and must be a string');
    } else if (!UUID_REGEX.test(user_id)) {
        errors.push('user_id must be a valid UUID');
    }

    // save_as — required
    if (!save_as || typeof save_as !== 'string') {
        errors.push('save_as is required and must be a string');
    } else if (save_as.trim().length === 0) {
        errors.push('save_as cannot be empty');
    } else if (save_as.trim().length > 50) {
        errors.push('save_as must be at most 50 characters');
    }

    // pincode — required
    if (!pincode || typeof pincode !== 'string') {
        errors.push('pincode is required and must be a string');
    } else {
        const trimmed = pincode.trim();
        if (trimmed.length === 0) {
            errors.push('pincode cannot be empty');
        } else if (!PINCODE_REGEX.test(trimmed)) {
            errors.push('pincode must be exactly 6 digits');
        }
    }

    // city — required
    if (!city || typeof city !== 'string') {
        errors.push('city is required and must be a string');
    } else {
        const trimmed = city.trim();
        if (trimmed.length === 0) {
            errors.push('city cannot be empty');
        } else if (trimmed.length > 50) {
            errors.push('city must be at most 50 characters');
        }
    }

    // state — required
    if (!state || typeof state !== 'string') {
        errors.push('state is required and must be a string');
    } else {
        const trimmed = state.trim();
        if (trimmed.length === 0) {
            errors.push('state cannot be empty');
        } else if (trimmed.length > 50) {
            errors.push('state must be at most 50 characters');
        }
    }

    // house_number — required
    if (!house_number || typeof house_number !== 'string') {
        errors.push('house_number is required and must be a string');
    } else {
        const trimmed = house_number.trim();
        if (trimmed.length === 0) {
            errors.push('house_number cannot be empty');
        } else if (trimmed.length > 100) {
            errors.push('house_number must be at most 100 characters');
        }
    }

    // street_locality — required
    if (!street_locality || typeof street_locality !== 'string') {
        errors.push('street_locality is required and must be a string');
    } else {
        const trimmed = street_locality.trim();
        if (trimmed.length === 0) {
            errors.push('street_locality cannot be empty');
        } else if (trimmed.length > 150) {
            errors.push('street_locality must be at most 150 characters');
        }
    }

    // mobile — required
    if (!mobile || typeof mobile !== 'string') {
        errors.push('mobile is required and must be a string');
    } else {
        const trimmed = mobile.trim();
        if (trimmed.length === 0) {
            errors.push('mobile cannot be empty');
        } else if (!MOBILE_REGEX.test(trimmed)) {
            errors.push('mobile must be exactly 10 digits');
        }
    }

    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }

    // Sanitize
    req.body.save_as = save_as.trim();
    req.body.pincode = pincode.trim();
    req.body.city = city.trim();
    req.body.state = state.trim();
    req.body.house_number = house_number.trim();
    req.body.street_locality = street_locality.trim();
    req.body.mobile = mobile.trim();

    next();
}

export function validateUpdateAddress(req: Request, res: Response, next: NextFunction): void {
    const { save_as, pincode, city, state, house_number, street_locality, mobile } = req.body;
    const errors: string[] = [];

    // At least one field must be provided
    if (save_as === undefined && pincode === undefined &&
        city === undefined && state === undefined && house_number === undefined &&
        street_locality === undefined && mobile === undefined) {
        errors.push('At least one field must be provided for update');
    }

    // save_as — optional
    if (save_as !== undefined) {
        if (typeof save_as !== 'string') {
            errors.push('save_as must be a string');
        } else if (save_as.trim().length === 0) {
            errors.push('save_as cannot be empty');
        } else if (save_as.trim().length > 50) {
            errors.push('save_as must be at most 50 characters');
        }
    }

    // pincode — optional
    if (pincode !== undefined) {
        if (typeof pincode !== 'string') {
            errors.push('pincode must be a string');
        } else {
            const trimmed = pincode.trim();
            if (trimmed.length === 0) {
                errors.push('pincode cannot be empty');
            } else if (!PINCODE_REGEX.test(trimmed)) {
                errors.push('pincode must be exactly 6 digits');
            }
        }
    }

    // city — optional
    if (city !== undefined) {
        if (typeof city !== 'string') {
            errors.push('city must be a string');
        } else {
            const trimmed = city.trim();
            if (trimmed.length === 0) {
                errors.push('city cannot be empty');
            } else if (trimmed.length > 50) {
                errors.push('city must be at most 50 characters');
            }
        }
    }

    // state — optional
    if (state !== undefined) {
        if (typeof state !== 'string') {
            errors.push('state must be a string');
        } else {
            const trimmed = state.trim();
            if (trimmed.length === 0) {
                errors.push('state cannot be empty');
            } else if (trimmed.length > 50) {
                errors.push('state must be at most 50 characters');
            }
        }
    }

    // house_number — optional
    if (house_number !== undefined) {
        if (typeof house_number !== 'string') {
            errors.push('house_number must be a string');
        } else {
            const trimmed = house_number.trim();
            if (trimmed.length === 0) {
                errors.push('house_number cannot be empty');
            } else if (trimmed.length > 100) {
                errors.push('house_number must be at most 100 characters');
            }
        }
    }

    // street_locality — optional
    if (street_locality !== undefined) {
        if (typeof street_locality !== 'string') {
            errors.push('street_locality must be a string');
        } else {
            const trimmed = street_locality.trim();
            if (trimmed.length === 0) {
                errors.push('street_locality cannot be empty');
            } else if (trimmed.length > 150) {
                errors.push('street_locality must be at most 150 characters');
            }
        }
    }

    // mobile — optional
    if (mobile !== undefined) {
        if (typeof mobile !== 'string') {
            errors.push('mobile must be a string');
        } else {
            const trimmed = mobile.trim();
            if (trimmed.length === 0) {
                errors.push('mobile cannot be empty');
            } else if (!MOBILE_REGEX.test(trimmed)) {
                errors.push('mobile must be exactly 10 digits');
            }
        }
    }

    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }

    // Sanitize
    if (save_as) req.body.save_as = save_as.trim();
    if (pincode) req.body.pincode = pincode.trim();
    if (city) req.body.city = city.trim();
    if (state) req.body.state = state.trim();
    if (house_number) req.body.house_number = house_number.trim();
    if (street_locality) req.body.street_locality = street_locality.trim();
    if (mobile) req.body.mobile = mobile.trim();

    next();
}
