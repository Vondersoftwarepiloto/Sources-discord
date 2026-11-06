const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sugerir')
    .setDescription('Envie uma sugestão para o servidor')
    .addStringOption(opt => opt.setName('sugestao').setDescription('Sua sugestão').setRequired(true)),

  async execute(interaction, client) {
    const texto = interaction.options.getString('sugestao');
    const config = client.config;

    const channelId = config.sugestoesChannelId || interaction.channel.id;
    const channel = interaction.guild.channels.cache.get(channelId) || interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTitle('💡 Nova Sugestão')
      .setDescription(texto)
      .setFooter({ text: `Sugestão • ID: ${interaction.user.id}` })
      .setTimestamp();

    const msg = await channel.send({ embeds: [embed] });
    await msg.react('👍');
    await msg.react('👎');
    await msg.react('✅');
    await msg.react('❌');

    await interaction.reply({ content: `✅ Sua sugestão foi enviada em ${channel}!`, ephemeral: true });
  }
};
