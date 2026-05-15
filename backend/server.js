import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import taxRecordRoutes from './routes/taxRecordRoutes.js';
import vatPdfRoutes from './routes/vatPdfRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

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

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`VAT PDF server listening on ${port}`);
});
