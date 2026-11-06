const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Desbloqueia o envio de mensagens no canal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(opt => opt.setName('canal').setDescription('Canal (padrão: atual)').addChannelTypes(ChannelType.GuildText)),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('canal') || interaction.channel;
    await channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: null });

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setDescription(`🔓 Canal ${channel} desbloqueado por ${interaction.user}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
