import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

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
        if (status === 503) {
          throw new Error('Serviço externo temporariamente indisponível');
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

export async function fetchWeeklyForecast(city: string) {
  try {
    const response = await axios.get(FORECAST_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang: 'pt_br',
        cnt: 40 // 5 dias com previsões a cada 3 horas
      }
    });

    const data = response.data;
    
    //  previsões por dia
    const dailyForecasts = groupForecastsByDay(data.list);
    
    return {
      cidade: data.city.name,
      pais: data.city.country,
      previsoes: dailyForecasts
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
        if (status === 503) {
          throw new Error('Serviço externo temporariamente indisponível');
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

function groupForecastsByDay(forecastList: any[]) {
  const dailyForecasts: any = {};
  
  forecastList.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (dayKey && !dailyForecasts[dayKey]) {
      dailyForecasts[dayKey] = {
        data: dayKey,
        previsoes: []
      };
    }
    
        if (dayKey) {
      dailyForecasts[dayKey].previsoes.push({
        hora: date.getHours(),
        temperatura: forecast.main.temp,
        descricao: forecast.weather[0].description,
        umidade: forecast.main.humidity,
        pressao: forecast.main.pressure
      });
         }
   });
  
  // convertendo para array e ordenando por data
  return Object.values(dailyForecasts).sort((a: any, b: any) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );
}
