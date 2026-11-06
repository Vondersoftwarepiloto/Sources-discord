const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Envia o painel de tickets com IA')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const config = client.config;

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('🤖 Central de Atendimento com IA')
      .setDescription('Selecione uma categoria para abrir um ticket.\nA inteligência artificial tentará te ajudar automaticamente enquanto a staff não assume.')
      .setFooter({ text: 'Sistema de Tickets + IA' });

    const select = new StringSelectMenuBuilder()
      .setCustomId('ticket_ia_category')
      .setPlaceholder('Escolha uma categoria...')
      .addOptions(config.categories.map(c => ({
        label: c.label,
        description: c.description,
        emoji: c.emoji,
        value: c.value
      })));

    await interaction.channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(select)]
    });
    await interaction.reply({ content: '✅ Painel enviado!', ephemeral: true });
  }
};
