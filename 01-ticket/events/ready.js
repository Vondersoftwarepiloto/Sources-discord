module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot de Ticket online como ${client.user.tag}`);
    client.user.setActivity('🎫 Sistema de Tickets', { type: 3 });
  }
};
