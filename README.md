# BeatTime-Server

Este projeto permite controlar a reprodução de músicas no Spotify usando botões físicos conectados a uma Raspberry Pi Pico W. Além disso, o sistema também fornece informações sobre a música em reprodução e a análise de batidas para integração com uma matriz de LEDs.

## Funcionalidades
- Autenticação do usuário no Spotify.
- Controle de reprodução:
  - **Botão A (GPIO 5)**: Pula para a faixa anterior
  - **Botão B (GPIO 6)**: Pular para a próxima faixa
- Exibição da faixa atualmente tocando.
- Indicação de erro ao conectar com a API do Spotify usando um LED vermelho (LED_RED).

## Tecnologias Utilizadas
- **Hardware**:
  - Raspberry Pi Pico W
  - Matriz de LEDs (25 LEDs)
  - Botões físicos
  - Display OLED
  - Microfone
- **Software**:
  - Node.js com Express
  - API do Spotify
  - Axios para requisições HTTP
  - Querystring para manipulação de URLs
  - Dotenv para gerenciamento de variáveis de ambiente

## Instalação e Configuração
### 1. Clonar o repositório
```sh
 git clone <URL_DO_REPOSITORIO>
 cd <NOME_DO_PROJETO>
```

### 2. Instalar dependências
```sh
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto e adicione as credenciais do Spotify:
```sh
SPOTIFY_CLIENT_ID=<seu_client_id>
SPOTIFY_CLIENT_SECRET=<seu_client_secret>
SPOTIFY_REDIRECT_URI=http://localhost:5000/callback
```

### 4. Iniciar o servidor
```sh
npm start
```
O servidor rodará em `http://localhost:5000`.

## Rotas Disponíveis
- `GET /login` - Redireciona o usuário para autenticação no Spotify.
- `GET /callback` - Recebe o token de acesso após o login.
- `GET /spotify` - Retorna a música atualmente tocando.
- `GET /spotify/next` - Pula para a próxima faixa.
- `GET /spotify/previous` - Retorna para a faixa anterior.
- `GET /beat` - Obtém informações sobre batidas da música atual.

## Contribuição
Sinta-se à vontade para abrir um PR com melhorias ou relatar problemas na aba de "Issues".
