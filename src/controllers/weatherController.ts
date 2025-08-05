import type { Request, Response } from 'express';
import * as weatherService from '../services/weatherService.js';

export async function getCurrentWeather(req: Request, res: Response) {
  const city = req.query.city as string;

  if (!city) {
    return res.status(400).json({ error: 'Cidade não informada' });
  }

  try {
    const weatherData = await weatherService.fetchCurrentWeather(city);
    res.json(weatherData);
  } catch (error: any) {
    if (error.message === 'Cidade não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Chave da API inválida ou não autorizada') {
      return res.status(401).json({ error: error.message });
    }
    if (error.message === 'Serviço externo temporariamente indisponível') {
      return res.status(503).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao buscar dados climáticos' });
  } 
}
