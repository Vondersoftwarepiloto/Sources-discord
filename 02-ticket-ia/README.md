# 🤖 Bot Ticket com IA

Sistema de tickets com respostas automáticas por Inteligência Artificial.

## Funcionalidades
- Painel com categorias
- Respostas automáticas da IA enquanto a staff não assume
- Botão para ativar/desativar a IA no ticket
- Assumir ticket (desativa IA automaticamente)
- Suporte a **OpenAI** ou **Groq** (gratuito e rápido)

## Configuração da IA

No arquivo `.env`:

```env
OPENAI_API_KEY=sua_chave_aqui
AI_PROVIDER=openai   # ou "groq"
```

### Opção gratuita recomendada (Groq):
1. Crie conta em https://console.groq.com
2. Gere uma API Key
3. Use `AI_PROVIDER=groq`

## Instalação
```bash
npm install
cp .env.example .env
# Configure TOKEN, CLIENT_ID, GUILD_ID e OPENAI_API_KEY
node index.js
```

## Comandos
- `/painel` - Envia o painel de tickets com IA
