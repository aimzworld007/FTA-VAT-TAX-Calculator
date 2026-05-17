import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
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
app.use('/api', appRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const distPath = path.resolve(__dirname, '../dist');
const hasBuiltFrontend = fs.existsSync(path.join(distPath, 'index.html'));

if (hasBuiltFrontend) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    return res.sendFile(path.resolve(__dirname, '../index.html'));
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(error?.status || 500).json({ success: false, message: error?.message || 'Internal server error' });
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
