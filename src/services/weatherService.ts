import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchCurrentWeather(city: string) {
  const response = await axios.get(BASE_URL, {
    params: {
      q: city,
      appid: API_KEY,
      units: 'metric',
      lang: 'pt_br'
    }
  });

  const data = response.data;

  return {
    cidade: data.name,
    temperatura: data.main.temp,
    descricao: data.weather[0].description,
    umidade: data.main.humidity
  };
}
