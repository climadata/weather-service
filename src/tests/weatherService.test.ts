import { jest } from '@jest/globals';

jest.unstable_mockModule('../services/weatherService.js', () => ({
  fetchCurrentWeather: jest.fn(),
}));

const weatherService = await import('../services/weatherService.js');
const { getCurrentWeather } = await import('../controllers/weatherController.js');
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
