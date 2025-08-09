import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchCurrentWeather(city: string) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'pt_br'
      }
    });

    const data = response.data;

    // Calcula o nascer e pôr do sol
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const currentWeather = {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Converte m/s para km/h
      visibility: Math.round(data.visibility / 1000), // Converte metros para km
      uvIndex: 0, // OpenWeather não fornece UV Index na API gratuita
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      sunrise,
      sunset
    };

    // Gera previsão do tempo simulada para os próximos 5 dias
    const forecast = Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return {
        day: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
        high: Math.round(currentWeather.temperature + Math.random() * 5),
        low: Math.round(currentWeather.temperature - Math.random() * 5),
        condition: currentWeather.condition,
        icon: "cloud",
        precipitation: Math.round(Math.random() * 100)
      };
    });

    return {
      current: currentWeather,
      forecast,
      alerts: [] // Por enquanto sem alertas
    };
  } catch (error) {

    if (axios.isAxiosError(error)) {
      
      if (error.response) {
        const status = error.response.status;

        if (status === 404) {
          throw new Error('Cidade não encontrada');
        }
        if (status === 401) {
          throw new Error('Chave da API inválida ou não autorizada');
        }
       
        throw new Error(`Erro da API: ${status} - ${error.response.statusText}`);
      
      } else if (error.request) {
        throw new Error('Erro de conexão com a API de clima. Verifique sua rede');
      } else {
        throw new Error(`Erro desconhecido: ${error.message}`);
      }

    } else {
      throw error;
    }
  }
}
