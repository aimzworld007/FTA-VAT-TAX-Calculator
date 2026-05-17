import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
import { ensureSchema } from './db/ensureSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(',') || process.env.FRONTEND_ORIGIN?.split(',') || true,
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
  res.sendFile(path.resolve(__dirname, '../index.html'));
});


app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(error?.status || 500).json({
    success: false,
    message: error?.message || 'Internal server error',
  });
});


const port = process.env.PORT || 8787;

async function startServer() {
  await ensureSchema();
  app.listen(port, () => {
    console.log(`VAT PDF server listening on ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to initialize API server:', error);
  process.exit(1);
});
