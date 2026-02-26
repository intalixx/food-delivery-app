import { Request, Response, NextFunction } from 'express';

/**
 * Validates the checkout/create order request body.
 * Expected body: { address_id: string, items: [{ product_id, qty }] }
 */
export const validateCreateOrder = (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    const { address_id, items } = req.body;

    // address_id is required UUID
    if (!address_id || typeof address_id !== 'string') {
        errors.push('address_id is required');
    } else {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(address_id)) {
            errors.push('address_id must be a valid UUID');
        }
    }

    // items array is required
    if (!items || !Array.isArray(items) || items.length === 0) {
        errors.push('items must be a non-empty array');
    } else {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        items.forEach((item: { product_id?: string; qty?: number }, index: number) => {
            if (!item.product_id || !uuidRegex.test(item.product_id)) {
                errors.push(`items[${index}].product_id must be a valid UUID`);
            }
            if (!item.qty || typeof item.qty !== 'number' || item.qty < 1 || !Number.isInteger(item.qty)) {
                errors.push(`items[${index}].qty must be a positive integer`);
            }
        });
    }

    if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
    }

    next();
};

/**
 * Validates the cancel order request.
 * Just ensures the order ID param is a valid UUID.
 */
export const validateCancelOrder = (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params.id as string;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || !uuidRegex.test(id)) {
        res.status(400).json({ success: false, errors: ['Invalid order ID'] });
        return;
    }

    next();
};
