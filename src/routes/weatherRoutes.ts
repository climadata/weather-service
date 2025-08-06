import express from 'express';
import { getCurrentWeather, getWeeklyForecast } from '../controllers/weatherController.js';

const router = express.Router();

router.get('/current', getCurrentWeather);
router.get('/weekly', getWeeklyForecast);

export default router;
