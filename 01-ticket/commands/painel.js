const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  PermissionFlagsBits 
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Envia o painel de abertura de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const config = client.config;

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('🎫 Central de Atendimento')
      .setDescription('Selecione abaixo a categoria do seu ticket para abrir um atendimento privado com a staff.')
      .setFooter({ text: 'Sistema de Tickets' })
      .setTimestamp();

    const select = new StringSelectMenuBuilder()
      .setCustomId('ticket_category')
      .setPlaceholder('Escolha uma categoria...')
      .addOptions(
        config.categories.map(cat => ({
          label: cat.label,
          description: cat.description,
          emoji: cat.emoji,
          value: cat.value
        }))
      );

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Painel enviado com sucesso!', ephemeral: true });
  }
};
