import express from 'express';
import { getCurrentWeather } from '../controllers/weatherController.js';

const router = express.Router();

// Health check endpoint da branch 'feat/CI', essencial para monitoramento.
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'weather-service',
    timestamp: new Date().toISOString()
  });
});

// Rota unificada para obter o tempo, usando o padrão mais claro com parâmetro de rota.
router.get('/current/:city', getCurrentWeather);

// Rota adicional para compatibilidade com o API Gateway da branch 'feat/CI'.
router.get('/city/:city', getCurrentWeather);

// Rota comentada da branch 'develop', mantida para referência futura.
//router.get('/weekly/:city', getWeeklyForecast);

export default router;