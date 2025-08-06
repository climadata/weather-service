import { jest } from '@jest/globals';
import axios from 'axios';

// mock axios
jest.mock('axios');
const mockedAxios = axios as any;

// mock variáveis de ambiente
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv, OPENWEATHER_API_KEY: 'test-api-key' };
  jest.clearAllMocks();
  mockedAxios.get = jest.fn();
});

afterEach(() => {
  process.env = originalEnv;
});

const { fetchCurrentWeather, fetchWeeklyForecast } = await import('../services/weatherService.js');

describe('weatherService.fetchCurrentWeather', () => {
  
  it('deve retornar dados do clima corretamente formatados', async () => {
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

    const result = await fetchCurrentWeather('São Paulo');

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

    expect(result).toEqual({
      cidade: 'São Paulo',
      temperatura: 25.5,
      descricao: 'céu limpo',
      umidade: 70
    });
  });

  it('deve lançar erro quando cidade não for encontrada (404)', async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        status: 404,
        statusText: 'Not Found'
      }
    };

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchCurrentWeather('CidadeInexistente')).rejects.toThrow('Cidade não encontrada');
  });

  it('deve lançar erro quando chave da API for inválida (401)', async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        status: 401,
        statusText: 'Unauthorized'
      }
    };

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchCurrentWeather('São Paulo')).rejects.toThrow('Chave da API inválida ou não autorizada');
  });

  it('deve lançar erro quando serviço estiver indisponível (503)', async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        status: 503,
        statusText: 'Service Unavailable'
      }
    };

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchCurrentWeather('São Paulo')).rejects.toThrow('Serviço externo temporariamente indisponível');
  });

  it('deve lançar erro quando houver erro de conexão', async () => {
    const mockError = {
      isAxiosError: true,
      request: {},
      message: 'Network Error'
    };

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchCurrentWeather('São Paulo')).rejects.toThrow('Erro de conexão com a API de clima. Verifique sua rede');
  });

  it('deve lançar erro para erros desconhecidos do axios', async () => {
    const mockError = {
      isAxiosError: true,
      message: 'Erro desconhecido'
    };

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchCurrentWeather('São Paulo')).rejects.toThrow('Erro desconhecido: Erro desconhecido');
  });

  it('deve lançar erro para erros não-axios', async () => {
    const mockError = new Error('Erro interno');

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchCurrentWeather('São Paulo')).rejects.toThrow('Erro interno');
  });

  it('deve lidar com dados de resposta inesperados', async () => {
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

    await expect(fetchCurrentWeather('São Paulo')).rejects.toThrow();
  });
});

describe('weatherService.fetchWeeklyForecast', () => {
  
  it('deve retornar previsão semanal corretamente formatada', async () => {
    const mockResponse = {
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

    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await fetchWeeklyForecast('São Paulo');

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

    expect(result).toEqual({
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
  });

  it('deve lançar erro quando cidade não for encontrada (404)', async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        status: 404,
        statusText: 'Not Found'
      }
    };

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchWeeklyForecast('CidadeInexistente')).rejects.toThrow('Cidade não encontrada');
  });

  it('deve lançar erro quando chave da API for inválida (401)', async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        status: 401,
        statusText: 'Unauthorized'
      }
    };

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchWeeklyForecast('São Paulo')).rejects.toThrow('Chave da API inválida ou não autorizada');
  });

  it('deve lançar erro quando serviço estiver indisponível (503)', async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        status: 503,
        statusText: 'Service Unavailable'
      }
    };

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchWeeklyForecast('São Paulo')).rejects.toThrow('Serviço externo temporariamente indisponível');
  });

  it('deve lançar erro quando houver erro de conexão', async () => {
    const mockError = {
      isAxiosError: true,
      request: {},
      message: 'Network Error'
    };

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchWeeklyForecast('São Paulo')).rejects.toThrow('Erro de conexão com a API de clima. Verifique sua rede');
  });

  it('deve lançar erro para erros desconhecidos do axios', async () => {
    const mockError = {
      isAxiosError: true,
      message: 'Erro desconhecido'
    };

    mockedAxios.get.mockRejectedValue(mockError);

    await expect(fetchWeeklyForecast('São Paulo')).rejects.toThrow('Erro desconhecido: Erro desconhecido');
  });

  it('deve lidar com lista de previsões vazia', async () => {
    const mockResponse = {
      data: {
        city: {
          name: 'São Paulo',
          country: 'BR'
        },
        list: []
      }
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await fetchWeeklyForecast('São Paulo');

    expect(result).toEqual({
      cidade: 'São Paulo',
      pais: 'BR',
      previsoes: []
    });
  });

  it('deve agrupar previsões do mesmo dia corretamente', async () => {
    const mockResponse = {
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
            dt: 1642237200, // 2022-01-15 13:00:00
            main: {
              temp: 26.0,
              humidity: 68,
              pressure: 1012
            },
            weather: [
              {
                description: 'poucas nuvens'
              }
            ]
          }
        ]
      }
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await fetchWeeklyForecast('São Paulo');

    expect(result.previsoes).toHaveLength(1);
    expect((result.previsoes as any)[0].data).toBe('2022-01-15');
    expect((result.previsoes as any)[0].previsoes).toHaveLength(2);
  });

  it('deve ordenar previsões por data', async () => {
    const mockResponse = {
      data: {
        city: {
          name: 'São Paulo',
          country: 'BR'
        },
        list: [
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
          },
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
          }
        ]
      }
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await fetchWeeklyForecast('São Paulo');

    expect((result.previsoes as any)[0].data).toBe('2022-01-15');
    expect((result.previsoes as any)[1].data).toBe('2022-01-16');
  });
});

describe('weatherService - casos edge', () => {
  
  it('deve lidar com dados de previsão malformados', async () => {
    const mockResponse = {
      data: {
        city: {
          name: 'São Paulo',
          country: 'BR'
        },
        list: [
          {
            dt: 1642233600,
            main: {
              temp: 25.5,
              humidity: 70,
              pressure: 1013
            },
            weather: [] 
          }
        ]
      }
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    await expect(fetchWeeklyForecast('São Paulo')).rejects.toThrow();
  });

  it('deve lidar com timestamp inválido', async () => {
    const mockResponse = {
      data: {
        city: {
          name: 'São Paulo',
          country: 'BR'
        },
        list: [
          {
            dt: 'invalid-timestamp',
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
          }
        ]
      }
    };

    mockedAxios.get.mockResolvedValue(mockResponse);

    await expect(fetchWeeklyForecast('São Paulo')).rejects.toThrow();
  });

  it('deve lidar com dados de temperatura inválidos', async () => {
    const mockResponse = {
      data: {
        name: 'São Paulo',
        main: {
          temp: 'invalid-temp',
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

    const result = await fetchCurrentWeather('São Paulo');
    expect(result.temperatura).toBe('invalid-temp');
  });
});


