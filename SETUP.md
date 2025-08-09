# Setup e Configuração - Weather Service

Este guia irá te ajudar a configurar e executar o projeto **weather-service** pela primeira vez.

## Passo a Passo para Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/climadata/weather-service.git
cd weather-service
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

Use o arquivo de exemplo como base:
```bash
cp env.example .env
```

Ou crie manualmente um arquivo `.env` na raiz do projeto:
```bash
touch .env
```

Adicione as seguintes variáveis ao arquivo `.env`:
```env
# Porta do servidor (opcional, padrão: 3001)
PORT=3001

# Chave da API do OpenWeatherMap (OBRIGATÓRIO)
# Use esta chave para testes iniciais:
OPENWEATHER_API_KEY=b6907d289e10d714a6e88b30761fae22
```

#### Sobre a chave da API:
**IMPORTANTE:** A chave fornecida acima é para testes e desenvolvimento inicial.

### 4. Compile o projeto
```bash
npm run build
```

## Como Executar o Projeto

### Modo Desenvolvimento (com hot reload)
```bash
npm run dev
```

### Modo Desenvolvimento (alternativo)
```bash
npm start
```

### Modo Produção
```bash
npm run build
node dist/index.js
```

## Executando os testes

Para executar os testes unitários:
```bash
npm test
```

## Verificando se o serviço está funcionando

Após iniciar o servidor, você pode testar os endpoints:

### 1. Verificar se o servidor está rodando
O servidor deve exibir a mensagem: `Servidor rodando na porta 3001`

### 2. Testar o endpoint de clima
```bash
# Usando curl
curl "http://localhost:3001/weather/current/São Paulo"

# Ou usando um navegador
http://localhost:3001/weather/current/São Paulo
```

### Resposta esperada:
```json
{
  "current": {
    "city": "São Paulo",
    "country": "BR",
    "temperature": 22,
    "condition": "céu limpo",
    "humidity": 65,
    "windSpeed": 8,
    "visibility": 10,
    "uvIndex": 0,
    "feelsLike": 24,
    "pressure": 1013,
    "sunrise": "06:30",
    "sunset": "18:45"
  },
  "forecast": [...],
  "alerts": []
}
```

## Estrutura do Projeto

```
weather-service/
├── src/
│   ├── controllers/        # Controladores das rotas
│   ├── services/          # Lógica de negócio
│   ├── routes/            # Definição das rotas
│   ├── config/            # Configurações
│   ├── utils/             # Utilitários
│   ├── tests/             # Testes unitários
│   └── index.ts           # Ponto de entrada da aplicação
├── dist/                  # Código compilado (gerado automaticamente)
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração do TypeScript
├── jest.config.js         # Configuração dos testes
├── nodemon.json           # Configuração do nodemon
├── env.example            # Template de variáveis de ambiente
├── .env                   # Variáveis de ambiente (criar baseado no env.example)
└── SETUP.md               # Este guia de configuração
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o servidor em modo desenvolvimento com hot reload |
| `npm run dev` | Inicia o servidor usando nodemon |
| `npm run build` | Compila o TypeScript para JavaScript |
| `npm test` | Executa os testes unitários |

## Solução de Problemas Comuns

### Erro: "OPENWEATHER_API_KEY is undefined"
- Verifique se o arquivo `.env` foi criado na raiz do projeto
- Confirme se a variável `OPENWEATHER_API_KEY` está definida no arquivo `.env`
- Reinicie o servidor após adicionar a variável

### Erro: "Porta já está em uso"
- Mude a porta no arquivo `.env` para uma porta disponível (ex: `PORT=3002`)
- Ou mate o processo que está usando a porta 3001

### Erro: "Cannot find module"
- Execute `npm install` para instalar todas as dependências
- Verifique se você está na pasta correta do projeto

### Erro: "Cidade não encontrada"
- Verifique se o nome da cidade está correto

## Suporte

Se você encontrar algum problema durante a configuração, verifique:
1. Se todas as dependências foram instaladas corretamente
2. Se as variáveis de ambiente estão configuradas
3. Se as versões do Node.js e npm são compatíveis
4. Se sua chave da API do OpenWeatherMap é válida

Para mais informações abra uma issue no repositório.
