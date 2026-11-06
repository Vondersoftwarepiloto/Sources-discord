# 🎫 Bot de Ticket

Sistema completo de tickets para Discord.

## Funcionalidades

- Painel com select menu de categorias
- Assumir ticket
- Criar canal de voz privado
- Notificar membro no privado
- Logs de fechamento
- Sistema de avaliação (1 a 5 estrelas)
- Limite de tickets por usuário
- Configuração via comando `/config`

## Instalação

```bash
npm install
cp .env.example .env
# Edite o .env com seu TOKEN, CLIENT_ID e GUILD_ID
node index.js
```

## Comandos

- `/painel` - Envia o painel de tickets (Admin)
- `/config ver` - Mostra configurações
- `/config staff` - Define cargo de staff
- `/config logs` - Define canal de logs

## Configuração

Edite o `config.json` para personalizar categorias, mensagens e cores.
