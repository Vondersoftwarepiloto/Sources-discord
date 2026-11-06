# 🛡️ Bot de Moderação

## Comandos
- `/ban` - Bane um usuário
- `/unban` - Remove banimento
- `/lock` - Bloqueia canal
- `/unlock` - Desbloqueia canal
- `/limpar` - Limpa mensagens

## Recursos extras
- Anti-spam automático (configurável no config.json)
- Logs de ações (defina logChannelId no config.json)

## Instalação
```bash
npm install
cp .env.example .env
# Configure TOKEN, CLIENT_ID, GUILD_ID
node index.js
```
