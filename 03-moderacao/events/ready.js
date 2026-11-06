module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot de Moderação online como ${client.user.tag}`);
    client.user.setActivity('🛡️ Moderando o servidor', { type: 3 });
  }
};
