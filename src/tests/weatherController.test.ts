import { jest } from '@jest/globals';

jest.unstable_mockModule('../services/weatherService.js', () => ({
  fetchCurrentWeather: jest.fn(),
  fetchWeeklyForecast: jest.fn()
}));

const weatherService = await import('../services/weatherService.js');
const { getCurrentWeather, getWeeklyForecast } = await import('../controllers/weatherController.js');
import type { Request, Response } from 'express';

describe('weatherController.getCurrentWeather - casos de teste', () => {
  
  beforeEach(() => {
    jest.resetAllMocks();
  });

  function mockResponse() {
    const res = {} as any;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  }

  it('retorna 200 e os dados do clima corretamente', async () => {
    const req = { query: { city: 'São Paulo' } } as unknown as Request;
    const res = mockResponse();

    const fakeWeatherData = {
      cidade: 'São Paulo',
      temperatura: 25,
      descricao: 'Ensolarado',
      umidade: 70,
    };

    (weatherService.fetchCurrentWeather as jest.MockedFunction<typeof weatherService.fetchCurrentWeather>)
      .mockResolvedValue(fakeWeatherData);

    await getCurrentWeather(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(fakeWeatherData);
  });

  it('retorna 400 se a cidade não for informada', async () => {
    const req = { query: {} } as unknown as Request;
    const res = mockResponse();

    await getCurrentWeather(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cidade não informada' });
  });

  it('retorna 404 se a cidade não for encontrada', async () => {
    const req = { query: { city: 'CidadeInexistente' } } as unknown as Request;
    const res = mockResponse();

    (weatherService.fetchCurrentWeather as jest.Mock).mockImplementation(() => {
      throw new Error('Cidade não encontrada');
    });

    await getCurrentWeather(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cidade não encontrada' });
  });

  it('retorna 401 se a chave da API for inválida ou não autorizada', async () => {
    const req = { query: { city: 'São Paulo' } } as unknown as Request;
    const res = mockResponse();

    (weatherService.fetchCurrentWeather as jest.Mock).mockImplementation(() => {
      throw new Error('Chave da API inválida ou não autorizada');
    });

    await getCurrentWeather(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Chave da API inválida ou não autorizada' });
  });

  it('retorna 503 para erro 503 do serviço externo', async () => {
    const req = { query: { city: 'São Paulo' } } as unknown as Request;
    const res = mockResponse();

    (weatherService.fetchCurrentWeather as jest.Mock).mockImplementation(() => {
      throw new Error('Serviço externo temporariamente indisponível');
    });

    await getCurrentWeather(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: 'Serviço externo temporariamente indisponível' });
  });

  it('retorna 500 para erros desconhecidos', async () => {
    const req = { query: { city: 'ErroQualquer' } } as unknown as Request;
    const res = mockResponse();

    (weatherService.fetchCurrentWeather as jest.Mock).mockImplementation(() => {
      throw new Error('Erro inesperado');
    });

    await getCurrentWeather(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar dados climáticos' });
  });
});

describe('weatherController.getWeeklyForecast - casos de teste', () => {
  
  beforeEach(() => {
    jest.resetAllMocks();
  });

  function mockResponse() {
    const res = {} as any;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  }

  it('retorna 200 e os dados da previsão semanal corretamente', async () => {
    const req = { query: { city: 'São Paulo' } } as unknown as Request;
    const res = mockResponse();

    const fakeForecastData = {
      cidade: 'São Paulo',
      pais: 'BR',
      previsoes: [
        {
          data: '2024-01-15',
          previsoes: [
            {
              hora: 9,
              temperatura: 22.5,
              descricao: 'céu limpo',
              umidade: 65,
              pressao: 1013
            },
            {
              hora: 12,
              temperatura: 25.0,
              descricao: 'poucas nuvens',
              umidade: 60,
              pressao: 1012
            }
          ]
        }
      ]
    };

    (weatherService.fetchWeeklyForecast as jest.MockedFunction<typeof weatherService.fetchWeeklyForecast>)
      .mockResolvedValue(fakeForecastData);

    await getWeeklyForecast(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(fakeForecastData);
  });

  it('retorna 400 se a cidade não for informada', async () => {
    const req = { query: {} } as unknown as Request;
    const res = mockResponse();

    await getWeeklyForecast(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cidade não informada' });
  });

  it('retorna 404 se a cidade não for encontrada', async () => {
    const req = { query: { city: 'CidadeInexistente' } } as unknown as Request;
    const res = mockResponse();

    (weatherService.fetchWeeklyForecast as jest.Mock).mockImplementation(() => {
      throw new Error('Cidade não encontrada');
    });

    await getWeeklyForecast(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cidade não encontrada' });
  });

  it('retorna 401 se a chave da API for inválida', async () => {
    const req = { query: { city: 'São Paulo' } } as unknown as Request;
    const res = mockResponse();

    (weatherService.fetchWeeklyForecast as jest.Mock).mockImplementation(() => {
      throw new Error('Chave da API inválida ou não autorizada');
    });

    await getWeeklyForecast(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Chave da API inválida ou não autorizada' });
  });

  it('retorna 503 para erro do serviço externo', async () => {
    const req = { query: { city: 'São Paulo' } } as unknown as Request;
    const res = mockResponse();

    (weatherService.fetchWeeklyForecast as jest.Mock).mockImplementation(() => {
      throw new Error('Serviço externo temporariamente indisponível');
    });

    await getWeeklyForecast(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: 'Serviço externo temporariamente indisponível' });
  });

  it('retorna 500 para erros desconhecidos', async () => {
    const req = { query: { city: 'São Paulo' } } as unknown as Request;
    const res = mockResponse();

    (weatherService.fetchWeeklyForecast as jest.Mock).mockImplementation(() => {
      throw new Error('Erro desconhecido');
    });

    await getWeeklyForecast(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar previsão semanal' });
  });

  it('processa previsões com múltiplos dias corretamente', async () => {
    const req = { query: { city: 'São Paulo' } } as unknown as Request;
    const res = mockResponse();

    const fakeForecastData = {
      cidade: 'São Paulo',
      pais: 'BR',
      previsoes: [
        {
          data: '2024-01-15',
          previsoes: [
            { hora: 9, temperatura: 22.5, descricao: 'céu limpo', umidade: 65, pressao: 1013 },
            { hora: 12, temperatura: 25.0, descricao: 'poucas nuvens', umidade: 60, pressao: 1012 }
          ]
        },
        {
          data: '2024-01-16',
          previsoes: [
            { hora: 9, temperatura: 20.0, descricao: 'nublado', umidade: 70, pressao: 1014 }
          ]
        }
      ]
    };

    (weatherService.fetchWeeklyForecast as jest.MockedFunction<typeof weatherService.fetchWeeklyForecast>)
      .mockResolvedValue(fakeForecastData);

    await getWeeklyForecast(req, res);

    expect(res.json).toHaveBeenCalledWith(fakeForecastData);
    expect(fakeForecastData.previsoes).toHaveLength(2);
    expect(fakeForecastData.previsoes[0]?.previsoes).toHaveLength(2);
    expect(fakeForecastData.previsoes[1]?.previsoes).toHaveLength(1);
  });

  it('valida estrutura da resposta da previsão semanal', async () => {
    const req = { query: { city: 'São Paulo' } } as unknown as Request;
    const res = mockResponse();

    const fakeForecastData = {
      cidade: 'São Paulo',
      pais: 'BR',
      previsoes: [
        {
          data: '2024-01-15',
          previsoes: [
            {
              hora: 9,
              temperatura: 22.5,
              descricao: 'céu limpo',
              umidade: 65,
              pressao: 1013
            }
          ]
        }
      ]
    };

    (weatherService.fetchWeeklyForecast as jest.MockedFunction<typeof weatherService.fetchWeeklyForecast>)
      .mockResolvedValue(fakeForecastData);

    await getWeeklyForecast(req, res);

    const responseData = res.json.mock.calls[0][0];
    
    //  estrutura da resposta
    expect(responseData).toHaveProperty('cidade');
    expect(responseData).toHaveProperty('pais');
    expect(responseData).toHaveProperty('previsoes');
    expect(Array.isArray(responseData.previsoes)).toBe(true);
    
    // estrutura de cada previsão
    const previsao = responseData.previsoes[0] as any;
    expect(previsao).toBeDefined();
    expect(previsao).toHaveProperty('data');
    expect(previsao).toHaveProperty('previsoes');
    expect(Array.isArray(previsao.previsoes)).toBe(true);
    
    // item de cada previsão
    const itemPrevisao = previsao.previsoes[0] as any;
    expect(itemPrevisao).toBeDefined();
    expect(itemPrevisao).toHaveProperty('hora');
    expect(itemPrevisao).toHaveProperty('temperatura');
    expect(itemPrevisao).toHaveProperty('descricao');
    expect(itemPrevisao).toHaveProperty('umidade');
    expect(itemPrevisao).toHaveProperty('pressao');
  });
}); 