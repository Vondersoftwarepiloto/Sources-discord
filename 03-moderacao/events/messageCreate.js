const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;
    const config = client.config.antispam;
    if (!config.enabled) return;

    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    const userData = client.spamMap.get(key) || { count: 0, last: now };

    if (now - userData.last > config.interval) {
      userData.count = 1;
      userData.last = now;
    } else {
      userData.count++;
    }
    client.spamMap.set(key, userData);

    if (userData.count >= config.maxMessages) {
      client.spamMap.delete(key);
      try {
        if (config.punishment === 'timeout') {
          await message.member.timeout(config.timeoutDuration, 'Anti-spam');
        }
        await message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#ED4245')
              .setDescription(`⚠️ <@${message.author.id}> foi punido por spam.`)
          ]
        });
      } catch {}
    }
  }
};
