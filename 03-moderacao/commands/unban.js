const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Remove o banimento de um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(opt => opt.setName('id').setDescription('ID do usuário').setRequired(true))
    .addStringOption(opt => opt.setName('motivo').setDescription('Motivo')),

  async execute(interaction, client) {
    const id = interaction.options.getString('id');
    const reason = interaction.options.getString('motivo') || 'Sem motivo';

    try {
      await interaction.guild.members.unban(id, reason);
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('✅ Usuário Desbanido')
        .addFields(
          { name: 'ID', value: id, inline: true },
          { name: 'Moderador', value: interaction.user.tag, inline: true },
          { name: 'Motivo', value: reason }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } catch {
      await interaction.reply({ content: '❌ Não foi possível desbanir. Verifique o ID.', ephemeral: true });
    }
  }
};
