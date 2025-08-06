import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import axios from 'axios';

// mock do axios
jest.mock('axios');
const mockedAxios = axios as any;

const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv, OPENWEATHER_API_KEY: 'test-api-key' };
  jest.clearAllMocks();

  mockedAxios.get = jest.fn();
});

afterEach(() => {
  process.env = originalEnv;
});


const weatherRoutes = await import('../routes/weatherRoutes.js');

describe('Integration Tests - Weather Service', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/weather', weatherRoutes.default);
  });

  describe('GET /api/weather/current - Integração Completa', () => {
    it('deve retornar dados do clima atual com sucesso', async () => {
      const mockWeatherResponse = {
        data: {
          name: 'São Paulo',
          main: {
            temp: 25.5,
            humidity: 70
          },
          weather: [
            {
              description: 'céu limpo'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockWeatherResponse);

      const response = await request(app)
        .get('/api/weather/current')
        .query({ city: 'São Paulo' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        cidade: 'São Paulo',
        temperatura: 25.5,
        descricao: 'céu limpo',
        umidade: 70
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'São Paulo',
            units: 'metric',
            lang: 'pt_br'
          })
        })
      );
    });

    it('deve retornar 400 quando cidade não for informada', async () => {
      const response = await request(app)
        .get('/api/weather/current')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Cidade não informada'
      });
    });

    it('deve retornar 404 quando cidade não for encontrada', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 404,
          statusText: 'Not Found'
        }
      };

      mockedAxios.get.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/weather/current')
        .query({ city: 'CidadeInexistente' })
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Cidade não encontrada'
      });
    });

    it('deve retornar 401 quando chave da API for inválida', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 401,
          statusText: 'Unauthorized'
        }
      };

      mockedAxios.get.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/weather/current')
        .query({ city: 'São Paulo' })
        .expect(401)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Chave da API inválida ou não autorizada'
      });
    });

    it('deve retornar 503 quando serviço externo estiver indisponível', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 503,
          statusText: 'Service Unavailable'
        }
      };

      mockedAxios.get.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/weather/current')
        .query({ city: 'São Paulo' })
        .expect(503)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Serviço externo temporariamente indisponível'
      });
    });

    it('deve retornar 500 para erros desconhecidos', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Erro desconhecido'
      };

      mockedAxios.get.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/weather/current')
        .query({ city: 'São Paulo' })
        .expect(500)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Erro ao buscar dados climáticos'
      });
    });
  });

  describe('GET /api/weather/weekly - Integração Completa', () => {
    it('deve retornar previsão semanal com sucesso', async () => {
      const mockForecastResponse = {
        data: {
          city: {
            name: 'São Paulo',
            country: 'BR'
          },
          list: [
            {
              dt: 1642233600, // 2022-01-15 12:00:00
              main: {
                temp: 25.5,
                humidity: 70,
                pressure: 1013
              },
              weather: [
                {
                  description: 'céu limpo'
                }
              ]
            },
            {
              dt: 1642244400, // 2022-01-15 15:00:00
              main: {
                temp: 27.0,
                humidity: 65,
                pressure: 1012
              },
              weather: [
                {
                  description: 'poucas nuvens'
                }
              ]
            },
            {
              dt: 1642320000, // 2022-01-16 12:00:00
              main: {
                temp: 22.0,
                humidity: 75,
                pressure: 1014
              },
              weather: [
                {
                  description: 'nublado'
                }
              ]
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockForecastResponse);

      const response = await request(app)
        .get('/api/weather/weekly')
        .query({ city: 'São Paulo' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        cidade: 'São Paulo',
        pais: 'BR',
        previsoes: [
          {
            data: '2022-01-15',
            previsoes: [
              {
                hora: 5,
                temperatura: 25.5,
                descricao: 'céu limpo',
                umidade: 70,
                pressao: 1013
              },
              {
                hora: 8,
                temperatura: 27.0,
                descricao: 'poucas nuvens',
                umidade: 65,
                pressao: 1012
              }
            ]
          },
          {
            data: '2022-01-16',
            previsoes: [
              {
                hora: 5,
                temperatura: 22.0,
                descricao: 'nublado',
                umidade: 75,
                pressao: 1014
              }
            ]
          }
        ]
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/forecast',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'São Paulo',
            units: 'metric',
            lang: 'pt_br',
            cnt: 40
          })
        })
      );
    });

    it('deve retornar 400 quando cidade não for informada', async () => {
      const response = await request(app)
        .get('/api/weather/weekly')
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Cidade não informada'
      });
    });

    it('deve retornar 404 quando cidade não for encontrada', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 404,
          statusText: 'Not Found'
        }
      };

      mockedAxios.get.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/weather/weekly')
        .query({ city: 'CidadeInexistente' })
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Cidade não encontrada'
      });
    });

    it('deve retornar 401 quando chave da API for inválida', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 401,
          statusText: 'Unauthorized'
        }
      };

      mockedAxios.get.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/weather/weekly')
        .query({ city: 'São Paulo' })
        .expect(401)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Chave da API inválida ou não autorizada'
      });
    });

    it('deve retornar 503 quando serviço externo estiver indisponível', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 503,
          statusText: 'Service Unavailable'
        }
      };

      mockedAxios.get.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/weather/weekly')
        .query({ city: 'São Paulo' })
        .expect(503)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Serviço externo temporariamente indisponível'
      });
    });

    it('deve retornar 500 para erros desconhecidos', async () => {
      const mockError = {
        isAxiosError: true,
        message: 'Erro desconhecido'
      };

      mockedAxios.get.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/weather/weekly')
        .query({ city: 'São Paulo' })
        .expect(500)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        error: 'Erro ao buscar previsão semanal'
      });
    });
  });

  describe('Casos Edge - Integração', () => {
    it('deve lidar com dados malformados da API', async () => {
      const mockResponse = {
        data: {
          name: 'São Paulo',
          main: {
            temp: 25.5,
            humidity: 70
          },
          weather: []
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const response = await request(app)
        .get('/api/weather/current')
        .query({ city: 'São Paulo' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('deve lidar com timeout da API', async () => {
      const mockError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      mockedAxios.get.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/weather/current')
        .query({ city: 'São Paulo' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('deve lidar com erro de rede', async () => {
      const mockError = {
        isAxiosError: true,
        request: {},
        message: 'Network Error'
      };

      mockedAxios.get.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/weather/current')
        .query({ city: 'São Paulo' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Performance e Concorrência', () => {
    it('deve lidar com múltiplas requisições simultâneas', async () => {
      const mockResponse = {
        data: {
          name: 'São Paulo',
          main: {
            temp: 25.5,
            humidity: 70
          },
          weather: [
            {
              description: 'céu limpo'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/weather/current')
          .query({ city: 'São Paulo' })
          .expect(200)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.body).toEqual({
          cidade: 'São Paulo',
          temperatura: 25.5,
          descricao: 'céu limpo',
          umidade: 70
        });
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(5);
    });

    it('deve manter consistência de resposta para mesma cidade', async () => {
      const mockResponse = {
        data: {
          name: 'Rio de Janeiro',
          main: {
            temp: 30.0,
            humidity: 80
          },
          weather: [
            {
              description: 'ensolarado'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const response1 = await request(app)
        .get('/api/weather/current')
        .query({ city: 'Rio de Janeiro' })
        .expect(200);

      const response2 = await request(app)
        .get('/api/weather/current')
        .query({ city: 'Rio de Janeiro' })
        .expect(200);

      expect(response1.body).toEqual(response2.body);
    });
  });
}); 