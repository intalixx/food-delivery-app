import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';

// Resolve .env path — works from both backend/ (dev) and backend/dist/ (production)
const envPath = path.resolve(__dirname, '..', '.env');
const envPathAlt = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: fs.existsSync(envPath) ? envPath : envPathAlt });

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Root
app.get('/', (_req, res) => {
    res.json({ message: 'Food Delivery API is running' });
});

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Routes
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import addressRoutes from './routes/addressRoutes';
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
