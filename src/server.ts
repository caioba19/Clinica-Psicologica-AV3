import 'dotenv/config'
import express from 'express';
// ... outras importações

const app = express();

// Rota base para teste e healthcheck
app.get('/', (req, res) => {
  res.json({
    message: 'API da Clínica Psicológica está online e rodando!',
    version: '1.0.0',
    status: 'OK'
  });
});