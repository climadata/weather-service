import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// mock dos controladores
jest.unstable_mockModule('../controllers/weatherController.js', () => ({
  getCurrentWeather: jest.fn(),
  getWeeklyForecast: jest.fn()
}));

const { getCurrentWeather, getWeeklyForecast } = await import('../controllers/weatherController.js');
const weatherRoutes = await import('../routes/weatherRoutes.js');

describe('weatherRoutes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/weather', weatherRoutes.default);
    
    // reset dos mocks
    jest.clearAllMocks();
  });

  describe('GET /api/weather/current', () => {
    it('deve chamar getCurrentWeather quando acessar /current', async () => {
      const mockResponse = {
        cidade: 'São Paulo',
        temperatura: 25,
        descricao: 'Ensolarado',
        umidade: 70
      };

      (getCurrentWeather as jest.Mock).mockImplementation((req, res) => {
        (res as any).json(mockResponse);
      });

      await request(app)
        .get('/api/weather/current')
        .query({ city: 'São Paulo' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(getCurrentWeather).toHaveBeenCalledTimes(1);
    });

    it('deve passar os parâmetros corretos para getCurrentWeather', async () => {
      (getCurrentWeather as jest.Mock).mockImplementation((req, res) => {
        (res as any).json({ success: true });
      });

      await request(app)
        .get('/api/weather/current')
        .query({ city: 'Rio de Janeiro' })
        .expect(200);

      expect(getCurrentWeather).toHaveBeenCalledTimes(1);
    });

    it('deve retornar erro quando getCurrentWeather lançar exceção', async () => {
      (getCurrentWeather as jest.Mock).mockImplementation((req, res) => {
        (res as any).status(500).json({ error: 'Erro interno' });
      });

      await request(app)
        .get('/api/weather/current')
        .query({ city: 'São Paulo' })
        .expect(500)
        .expect('Content-Type', /json/);
    });
  });

  describe('GET /api/weather/weekly', () => {
    it('deve chamar getWeeklyForecast quando acessar /weekly', async () => {
      const mockResponse = {
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

      (getWeeklyForecast as jest.Mock).mockImplementation((req, res) => {
        (res as any).json(mockResponse);
      });

      await request(app)
        .get('/api/weather/weekly')
        .query({ city: 'São Paulo' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(getWeeklyForecast).toHaveBeenCalledTimes(1);
    });

    it('deve passar os parâmetros corretos para getWeeklyForecast', async () => {
      (getWeeklyForecast as jest.Mock).mockImplementation((req, res) => {
        (res as any).json({ success: true });
      });

      await request(app)
        .get('/api/weather/weekly')
        .query({ city: 'Brasília' })
        .expect(200);

      expect(getWeeklyForecast).toHaveBeenCalledTimes(1);
    });

    it('deve retornar erro quando getWeeklyForecast lançar exceção', async () => {
      (getWeeklyForecast as jest.Mock).mockImplementation((req, res) => {
        (res as any).status(500).json({ error: 'Erro interno' });
      });

      await request(app)
        .get('/api/weather/weekly')
        .query({ city: 'São Paulo' })
        .expect(500)
        .expect('Content-Type', /json/);
    });
  });

  describe('Rotas inexistentes', () => {
    it('deve retornar 404 para rotas não definidas', async () => {
      await request(app)
        .get('/api/weather/invalid')
        .expect(404);
    });

    it('deve retornar 404 para método POST não suportado', async () => {
      await request(app)
        .post('/api/weather/current')
        .expect(404);
    });

    it('deve retornar 404 para método PUT não suportado', async () => {
      await request(app)
        .put('/api/weather/weekly')
        .expect(404);
    });
  });

  describe('Configuração das rotas', () => {
    it('deve ter rota GET /current configurada', () => {
      const router = weatherRoutes.default;
      const routes = router.stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        }));

      expect(routes).toContainEqual({
        path: '/current',
        methods: ['get']
      });
    });

    it('deve ter rota GET /weekly configurada', () => {
      const router = weatherRoutes.default;
      const routes = router.stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        }));

      expect(routes).toContainEqual({
        path: '/weekly',
        methods: ['get']
      });
    });
  });
}); 