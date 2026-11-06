const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Painéis da facção')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName('registro').setDescription('Painel de registro de membros'))
    .addSubcommand(s => s.setName('farm').setDescription('Painel de farm da semana'))
    .addSubcommand(s => s.setName('ranking').setDescription('Mostra ranking de farm')),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const dataPath = path.join(__dirname, '../data/fac.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    if (sub === 'registro') {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle('📋 Registro de Membros da Fac')
        .setDescription('Clique no botão abaixo para se registrar como membro da facção.')
        .setFooter({ text: 'Sistema de Fac' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('fac_registrar').setLabel('Registrar-se').setStyle(ButtonStyle.Primary).setEmoji('📝')
      );

      await interaction.channel.send({ embeds: [embed], components: [row] });
      return interaction.reply({ content: '✅ Painel de registro enviado!', ephemeral: true });
    }

    if (sub === 'farm') {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle('🌾 Farm da Semana')
        .setDescription('Clique no botão toda vez que realizar um farm.\nO sistema contabiliza automaticamente.')
        .setFooter({ text: 'Sistema de Fac' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('fac_farm').setLabel('Registrar Farm').setStyle(ButtonStyle.Success).setEmoji('🌾')
      );

      await interaction.channel.send({ embeds: [embed], components: [row] });
      return interaction.reply({ content: '✅ Painel de farm enviado!', ephemeral: true });
    }

    if (sub === 'ranking') {
      const membros = Object.entries(data.membros || {})
        .map(([id, m]) => ({ id, ...m }))
        .sort((a, b) => (b.farmSemana || 0) - (a.farmSemana || 0))
        .slice(0, 10);

      const desc = membros.length
        ? membros.map((m, i) => `**${i + 1}.** <@${m.id}> — ${m.farmSemana || 0} farms`).join('\n')
        : 'Nenhum farm registrado ainda.';

      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle('🏆 Ranking de Farm da Semana')
        .setDescription(desc)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  }
};
