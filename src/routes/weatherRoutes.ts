import express from 'express';
import { getCurrentWeather } from '../controllers/weatherController.js';

const router = express.Router();

router.get('/current/:city', getCurrentWeather);
//router.get('/weekly/:city', getWeeklyForecast);

export default router;
