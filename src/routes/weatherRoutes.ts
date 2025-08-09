import express from 'express';
import { getCurrentWeather } from '../controllers/weatherController.js';

const router = express.Router();

// Rota para compatibilidade com o API Gateway
router.get('/city/:city', getCurrentWeather);
// Rota original
router.get('/current', getCurrentWeather);

export default router;
