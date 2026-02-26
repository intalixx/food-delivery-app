import path from 'path';

/**
 * Returns the absolute path to the uploads directory based on APP_ENVIRONMENT.
 *
 * - development: backend/uploads/
 * - production:  backend/dist/uploads/
 *
 * __dirname in controllers/middleware is:
 *   dev  → backend/controllers/ or backend/middleware/
 *   prod → backend/dist/controllers/ or backend/dist/middleware/
 *
 * So `path.resolve(__dirname, '..')` always gives us the "root" for the current mode.
 */
export function getUploadsDir(): string {
    const isProduction = process.env.APP_ENVIRONMENT === 'production';

    if (isProduction) {
        // prod: __dirname could be dist/utils/, go up to dist/ then into uploads/
        return path.resolve(__dirname, '..', 'uploads');
    }

    // dev: __dirname is backend/utils/, go up to backend/ then into uploads/
    return path.resolve(__dirname, '..', 'uploads');
}

/**
 * Resolves the full file path for a stored image_path like "/uploads/products/img.jpg"
 */
export function resolveImagePath(imagePath: string): string {
    const uploadsDir = getUploadsDir();
    // image_path is stored as "/uploads/products/file.jpg" — strip the leading "/uploads/"
    const relative = imagePath.replace(/^\/uploads\/?/, '');
    return path.resolve(uploadsDir, relative);
}
