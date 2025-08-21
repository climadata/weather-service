import express from 'express';
import dotenv from 'dotenv';
import weatherRoutes from './routes/weatherRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// rotas "globais" do serviço
app.get('/', (_req, res) => {
  res.send('Weather service up');
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'weather' });
});

// rotas de negócio em /weather
app.use('/weather', weatherRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
