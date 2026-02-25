import { Request, Response, NextFunction } from 'express';

interface ProductBody {
    product_name?: string;
    description?: string;
    price?: number;
    category_id?: string;
}

const PRODUCT_NAME_MAX = 50;
const DESCRIPTION_MAX = 100;
const PRICE_MAX = 9999.99;

// Only letters, numbers, spaces, hyphens, ampersands, and apostrophes allowed
const PRODUCT_NAME_REGEX = /^[a-zA-Z0-9\s\-&']+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateCreateProduct(req: Request, res: Response, next: NextFunction): void {
    const { product_name, description, price, category_id }: ProductBody = req.body;
    const errors: string[] = [];

    // product_name — required
    if (!product_name || typeof product_name !== 'string') {
        errors.push('product_name is required and must be a string');
    } else {
        const trimmed = product_name.trim();
        if (trimmed.length === 0) {
            errors.push('product_name cannot be empty');
        } else if (trimmed.length > PRODUCT_NAME_MAX) {
            errors.push(`product_name must be at most ${PRODUCT_NAME_MAX} characters`);
        } else if (!PRODUCT_NAME_REGEX.test(trimmed)) {
            errors.push('product_name can only contain letters, numbers, spaces, hyphens, ampersands, and apostrophes');
        }
    }

    // description — optional but validated if provided
    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('description must be a string');
        } else if (description.trim().length > DESCRIPTION_MAX) {
            errors.push(`description must be at most ${DESCRIPTION_MAX} characters`);
        }
    }

    // price — required (form-data sends as string)
    const rawPrice = req.body.price;
    const parsedPrice = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;
    if (rawPrice === undefined || rawPrice === null || rawPrice === '') {
        errors.push('price is required');
    } else if (isNaN(parsedPrice)) {
        errors.push('price must be a valid number');
    } else if (parsedPrice < 0) {
        errors.push('price cannot be negative');
    } else if (parsedPrice > PRICE_MAX) {
        errors.push(`price cannot exceed ${PRICE_MAX}`);
    } else {
        const decimalParts = parsedPrice.toString().split('.');
        if (decimalParts[1] && decimalParts[1].length > 2) {
            errors.push('price can have at most 2 decimal places');
        }
    }

    // category_id — required
    if (!category_id || typeof category_id !== 'string') {
        errors.push('category_id is required and must be a string');
    } else if (!UUID_REGEX.test(category_id)) {
        errors.push('category_id must be a valid UUID');
    }

    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }

    // Sanitize — trim whitespace
    req.body.product_name = product_name!.trim();
    if (description) req.body.description = description.trim();

    next();
}

export function validateUpdateProduct(req: Request, res: Response, next: NextFunction): void {
    const { product_name, description, price, category_id }: ProductBody = req.body;
    const errors: string[] = [];

    // At least one field must be provided
    if (product_name === undefined && description === undefined && price === undefined && category_id === undefined) {
        errors.push('At least one field (product_name, description, price, category_id) must be provided');
    }

    // product_name — optional but validated if provided
    if (product_name !== undefined) {
        if (typeof product_name !== 'string') {
            errors.push('product_name must be a string');
        } else {
            const trimmed = product_name.trim();
            if (trimmed.length === 0) {
                errors.push('product_name cannot be empty');
            } else if (trimmed.length > PRODUCT_NAME_MAX) {
                errors.push(`product_name must be at most ${PRODUCT_NAME_MAX} characters`);
            } else if (!PRODUCT_NAME_REGEX.test(trimmed)) {
                errors.push('product_name can only contain letters, numbers, spaces, hyphens, ampersands, and apostrophes');
            }
        }
    }

    // description — optional but validated if provided
    if (description !== undefined && description !== null) {
        if (typeof description !== 'string') {
            errors.push('description must be a string');
        } else if (description.trim().length > DESCRIPTION_MAX) {
            errors.push(`description must be at most ${DESCRIPTION_MAX} characters`);
        }
    }

    // price — optional but validated if provided (form-data sends as string)
    const rawUpdatePrice = req.body.price;
    if (rawUpdatePrice !== undefined && rawUpdatePrice !== '') {
        const parsedUpdatePrice = typeof rawUpdatePrice === 'string' ? parseFloat(rawUpdatePrice) : rawUpdatePrice;
        if (isNaN(parsedUpdatePrice)) {
            errors.push('price must be a valid number');
        } else if (parsedUpdatePrice < 0) {
            errors.push('price cannot be negative');
        } else if (parsedUpdatePrice > PRICE_MAX) {
            errors.push(`price cannot exceed ${PRICE_MAX}`);
        } else {
            const decimalParts = parsedUpdatePrice.toString().split('.');
            if (decimalParts[1] && decimalParts[1].length > 2) {
                errors.push('price can have at most 2 decimal places');
            }
        }
    }

    // category_id — optional but validated if provided
    if (category_id !== undefined) {
        if (typeof category_id !== 'string') {
            errors.push('category_id must be a string');
        } else if (!UUID_REGEX.test(category_id)) {
            errors.push('category_id must be a valid UUID');
        }
    }

    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }

    // Sanitize
    if (product_name) req.body.product_name = product_name.trim();
    if (description) req.body.description = description.trim();

    next();
}

export function validateUUID(req: Request, res: Response, next: NextFunction): void {
    const id = req.params.id as string;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!id || !uuidRegex.test(id)) {
        res.status(400).json({ success: false, errors: ['Invalid ID format'] });
        return;
    }

    next();
}
