const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { generateResponse } = require('../utils/ai');

const ticketsPath = path.join(__dirname, '../data/tickets.json');

function loadTickets() {
  if (!fs.existsSync(ticketsPath)) return {};
  return JSON.parse(fs.readFileSync(ticketsPath, 'utf8'));
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const tickets = loadTickets();
    const ticket = Object.values(tickets).find(t => t.channelId === message.channel.id && t.open);
    if (!ticket || !ticket.aiEnabled) return;

    // Só responde mensagens do dono do ticket
    if (message.author.id !== ticket.userId) return;

    // Evita responder se a staff já falou recentemente (opcional)
    await message.channel.sendTyping();

    const reply = await generateResponse(message.content, client.config.aiSystemPrompt);

    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setAuthor({ name: 'Assistente IA', iconURL: client.user.displayAvatarURL() })
      .setDescription(reply)
      .setFooter({ text: 'Resposta automática • Staff pode assumir a qualquer momento' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
