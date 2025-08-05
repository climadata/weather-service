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

    return {
      cidade: data.name,
      temperatura: data.main.temp,
      descricao: data.weather[0].description,
      umidade: data.main.humidity
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
