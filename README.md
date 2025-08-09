## Setup Inicial (primeira execução)

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure as variáveis de ambiente
Copie o arquivo de exemplo e edite conforme necessário:
```bash
cp env.example .env
```

Ou crie manualmente um arquivo `.env` na raiz do projeto com:
```env
PORT=3001
OPENWEATHER_API_KEY=b6907d289e10d714a6e88b30761fae22
```

**Sobre a chave da API:**
- A chave acima é para testes iniciais, deve ser inserida para que funcione plenamente
- Substitua pela chave no arquivo `.env`

### 3. Execute o projeto
```bash
npm run dev
```

## Scripts Disponíveis
- `npm start` - Inicia com ts-node-dev (hot reload)
- `npm run dev` - Inicia com nodemon
- `npm run build` - Compila TypeScript para JavaScript
- `npm test` - Executa os testes

## Testando a API
Após iniciar o servidor, teste o endpoint:
```bash
curl "http://localhost:3001/weather/current/São Paulo"
```

## Pré-requisitos
- Node.js (versão 18+)
- npm
- Chave da API do OpenWeatherMap
