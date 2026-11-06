module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot Ticket IA online como ${client.user.tag}`);
    client.user.setActivity('🤖 Tickets com IA', { type: 3 });
  }
};
