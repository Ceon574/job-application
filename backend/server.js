import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import applicationRoutes from './routes/applicationRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        CLIENT_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ];

      if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome message
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Job Application Tracker API is running.',
    healthCheck: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      list: 'GET /api/applications',
      stats: 'GET /api/applications/stats',
      create: 'POST /api/applications',
      getOne: 'GET /api/applications/:id',
      update: 'PUT /api/applications/:id',
      updateStatus: 'PATCH /api/applications/:id/status',
      delete: 'DELETE /api/applications/:id',
    },
  });
});

// Serverless database connection middleware
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await connectDB();
  }
  next();
});

// API Routes
app.use('/api', applicationRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 Job Application Tracker API running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use by another process.`);
      console.error(`👉 Run 'Stop-Process -Id <PID> -Force' or specify a different PORT in backend/.env (e.g. PORT=5001).`);
      process.exit(1);
    } else {
      console.error(`❌ Server error: ${err.message}`);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
  });

  return server;
};

// Export app for testing purposes
export default app;

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
