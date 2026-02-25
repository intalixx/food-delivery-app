import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
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
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
