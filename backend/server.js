import express from 'express';
import vatPdfRoutes from './routes/vatPdfRoutes.js';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/api', vatPdfRoutes);

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`VAT PDF server listening on ${port}`);
});
