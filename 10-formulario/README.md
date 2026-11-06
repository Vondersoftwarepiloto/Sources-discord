# 📩 Bot de Formulário

Formulário configurável com modal (até 5 perguntas).

## Funcionalidades
- Painel com botão
- Modal com perguntas personalizáveis (edite o config.json)
- Envio das respostas para canal de logs

## Personalizar perguntas
Edite o array `perguntas` no `config.json`.

## Instalação
```bash
npm install
cp .env.example .env
node index.js
```

## Comandos
- `/formulario painel` - Envia o painel
- `/formulario logs` - Define canal de logs
