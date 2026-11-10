import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { patientRoutes } from './routes/patientRoutes';
import { sessionRoutes } from './routes/sessionRoutes';
import { authRoutes } from './routes/authRoutes';
import { psychologistRoutes } from './routes/psychologistRoutes';
import { auditLogRoutes } from './routes/auditLogRoutes';
import { appointmentRoutes } from './routes/appointmentRoutes';
import { preferencesRoutes } from './routes/preferencesRoutes';
import { financeRoutes } from './routes/financeRoutes';
import { therapyTaskRoutes } from './routes/therapyTaskRoutes';
import { reportRoutes } from './routes/reportRoutes';

const app = express();
app.disable('x-powered-by');
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use(cors({
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)),
  credentials: true
}));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(express.json({ limit: '32kb' }));

app.use('/api', patientRoutes);
app.use('/api', sessionRoutes);
app.use('/api', authRoutes);
app.use('/api', psychologistRoutes);
app.use('/api', auditLogRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', preferencesRoutes);
app.use('/api', financeRoutes);
app.use('/api', therapyTaskRoutes);
app.use('/api', reportRoutes);

app.get('/api/health', (req, res) => {
  return res.status(200).json({ status: 'OK', message: 'API PsicoManager rodando!' });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(error);
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'A requisição excede o tamanho permitido.' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ error: 'O corpo da requisição contém JSON inválido.' });
  }
  console.error('Falha inesperada na API:', error);
  return res.status(500).json({ error: 'Não foi possível processar a solicitação.' });
});

export { app };
