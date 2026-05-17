import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import taxRecordRoutes from './routes/taxRecordRoutes.js';
import vatPdfRoutes from './routes/vatPdfRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import appRoutes from './routes/appRoutes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 });
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tax-records', taxRecordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', vatPdfRoutes);
app.use('/api', appRoutes);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'API is running. Use /api/health to verify status.',
  });
});


app.use((error, _req, res, _next) => {
  const isPrismaInitError =
    error?.name === 'PrismaClientInitializationError' ||
    error?.code === 'P1001' ||
    error?.code === 'P1012';

  if (isPrismaInitError) {
    return res.status(503).json({
      error: 'Database is not ready. Run Prisma migrations and ensure DATABASE_URL is valid.',
      code: error?.code || 'PRISMA_INIT_ERROR',
    });
  }

  console.error(error);
  return res.status(500).json({
    error: 'Internal server error',
  });
});


const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`VAT PDF server listening on ${port}`);
});
