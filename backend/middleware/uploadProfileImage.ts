import multer from 'multer';
import path from 'path';
import fs from 'fs';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = path.resolve(__dirname, '..', 'uploads', 'profile');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg, bmp, tiff)'));
    }
};

export const uploadProfileImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE }
});
