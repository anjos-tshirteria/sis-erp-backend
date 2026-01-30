import express from 'express';
import { env } from '@src/config/env';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.send('API funcionando!');
});

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});