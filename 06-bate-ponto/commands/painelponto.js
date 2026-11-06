const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painelponto')
    .setDescription('Envia o painel de bate-ponto')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle('⏱️ Sistema de Bate-Ponto')
      .setDescription('Clique nos botões abaixo para **abrir** ou **fechar** seu ponto.\nO sistema contabiliza automaticamente as horas trabalhadas.')
      .setFooter({ text: 'Bate-Ponto' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('ponto_abrir').setLabel('Abrir Ponto').setStyle(ButtonStyle.Success).setEmoji('🟢'),
      new ButtonBuilder().setCustomId('ponto_fechar').setLabel('Fechar Ponto').setStyle(ButtonStyle.Danger).setEmoji('🔴')
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Painel de bate-ponto enviado!', ephemeral: true });
  }
};
