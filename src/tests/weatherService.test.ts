import { fetchCurrentWeather } from '../services/weatherService.js';

describe('fetchCurrentWeather', () => {
  it('deve retornar dados climáticos para uma cidade válida', async () => {
    const dados = await fetchCurrentWeather('São Paulo');
    expect(dados).toHaveProperty('cidade');
    expect(dados).toHaveProperty('temperatura');
    expect(dados).toHaveProperty('descricao');
    expect(dados).toHaveProperty('umidade');
  });
});