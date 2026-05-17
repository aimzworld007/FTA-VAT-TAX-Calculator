import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from '../backend/routes/authRoutes.js';
import appRoutes from '../backend/routes/appRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use('/api', appRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
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
  return res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(distPath, 'index.html'));
  });
}

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
