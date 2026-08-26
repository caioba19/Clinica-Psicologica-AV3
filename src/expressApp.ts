import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { patientRoutes } from './routes/patientRoutes';
import { sessionRoutes } from './routes/sessionRoutes';
import { authRoutes } from './routes/authRoutes';
import { psychologistRoutes } from './routes/psychologistRoutes';
import { auditLogRoutes } from './routes/auditLogRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', patientRoutes);
app.use('/api', sessionRoutes);
app.use('/api', authRoutes);
app.use('/api', psychologistRoutes);
app.use('/api', auditLogRoutes);

app.get('/api/health', (req, res) => {
  return res.status(200).json({ status: 'OK', message: 'API PsicoManager rodando!' });
});

export { app };