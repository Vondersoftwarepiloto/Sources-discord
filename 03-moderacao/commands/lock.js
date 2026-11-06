const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Bloqueia o envio de mensagens no canal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(opt => opt.setName('canal').setDescription('Canal (padrão: atual)').addChannelTypes(ChannelType.GuildText)),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('canal') || interaction.channel;
    await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });

    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setDescription(`🔒 Canal ${channel} bloqueado por ${interaction.user}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
