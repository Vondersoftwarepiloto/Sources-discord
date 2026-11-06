const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('captcha')
    .setDescription('Painel e configurações do captcha')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName('painel').setDescription('Envia o painel de captcha'))
    .addSubcommand(s => s.setName('cargo').setDescription('Define o cargo de verificado')
      .addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true))),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'painel') {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle('🔐 Verificação por Captcha')
        .setDescription('Para acessar o servidor, clique no botão abaixo e digite o código que aparecer.\n\nIsso ajuda a proteger o servidor contra bots e contas falsas.')
        .setFooter({ text: 'Sistema de Segurança' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('iniciar_captcha')
          .setLabel('Iniciar Verificação')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🔐')
      );

      await interaction.channel.send({ embeds: [embed], components: [row] });
      return interaction.reply({ content: '✅ Painel enviado!', ephemeral: true });
    }

    if (sub === 'cargo') {
      const role = interaction.options.getRole('cargo');
      client.config.verifiedRoleId = role.id;
      fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(client.config, null, 2));
      return interaction.reply({ content: `✅ Cargo de verificado definido para ${role}.`, ephemeral: true });
    }
  }
};
