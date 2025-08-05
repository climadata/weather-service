import type { Request, Response } from 'express';
import { fetchCurrentWeather } from '../services/weatherService.js';

export async function getCurrentWeather(req: Request, res: Response) {
  const city = req.query.city as string;

  if (!city) {
    return res.status(400).json({ error: 'Cidade não informada.' });
  }

  try {
    const weatherData = await fetchCurrentWeather(city);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados climáticos.' });
  }
}
