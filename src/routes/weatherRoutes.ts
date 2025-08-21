import express from 'express';
import { getCurrentWeather } from '../controllers/weatherController.js';

const router = express.Router();

// Health check endpoint para Docker
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'weather-service',
    timestamp: new Date().toISOString()
  });
});

// Rota para compatibilidade com o API Gateway
router.get('/city/:city', getCurrentWeather);
// Rota original
router.get('/current', getCurrentWeather);

export default router;
