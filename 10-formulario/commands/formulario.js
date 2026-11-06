const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('formulario')
    .setDescription('Sistema de formulário')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName('painel').setDescription('Envia o painel do formulário'))
    .addSubcommand(s => s.setName('logs').setDescription('Define canal de logs')
      .addChannelOption(o => o.setName('canal').setDescription('Canal').addChannelTypes(ChannelType.GuildText).setRequired(true))),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'painel') {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle('📝 Formulário')
        .setDescription('Clique no botão abaixo para preencher o formulário.\nSuas respostas serão enviadas para a staff.')
        .setFooter({ text: 'Sistema de Formulário' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('abrir_formulario').setLabel('Preencher Formulário').setStyle(ButtonStyle.Primary).setEmoji('📝')
      );

      await interaction.channel.send({ embeds: [embed], components: [row] });
      return interaction.reply({ content: '✅ Painel enviado!', ephemeral: true });
    }

    if (sub === 'logs') {
      client.config.logChannelId = interaction.options.getChannel('canal').id;
      fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(client.config, null, 2));
      return interaction.reply({ content: '✅ Canal de logs definido.', ephemeral: true });
    }
  }
};
