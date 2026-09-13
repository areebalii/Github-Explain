import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import explainRouter from './routers/explain.router.js';

dotenv.config();

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Routes
app.use('/api/v1/explain', explainRouter);

// Health check endpoint
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the GitHub Explain API' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  console.error(`[API ERROR ${statusCode}]: ${err.message}`);
  res.status(statusCode).json({
    error: err.message || 'An unexpected internal error occurred.',
  });
});


const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Only listen if not running on Vercel
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    }
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

export default app;