const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bane um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(opt => opt.setName('usuario').setDescription('Usuário a banir').setRequired(true))
    .addStringOption(opt => opt.setName('motivo').setDescription('Motivo do banimento'))
    .addIntegerOption(opt => opt.setName('dias').setDescription('Dias de mensagens para apagar (0-7)').setMinValue(0).setMaxValue(7)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('usuario');
    const reason = interaction.options.getString('motivo') || 'Sem motivo informado';
    const days = interaction.options.getInteger('dias') || 0;

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (member && !member.bannable) {
      return interaction.reply({ content: '❌ Não posso banir este usuário.', ephemeral: true });
    }

    await interaction.guild.members.ban(user.id, { reason, deleteMessageSeconds: days * 86400 });
    
    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle('🔨 Usuário Banido')
      .addFields(
        { name: 'Usuário', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
        { name: 'Motivo', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    if (client.config.logChannelId) {
      const log = interaction.guild.channels.cache.get(client.config.logChannelId);
      if (log) log.send({ embeds: [embed] });
    }
  }
};
