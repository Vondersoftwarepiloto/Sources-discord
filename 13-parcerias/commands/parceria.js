const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('parceria')
    .setDescription('Sistema de parcerias')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName('painel').setDescription('Envia o painel de parcerias'))
    .addSubcommand(s => s.setName('logs').setDescription('Define canal de logs')
      .addChannelOption(o => o.setName('canal').setDescription('Canal').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(s => s.setName('staff').setDescription('Define cargo da staff')
      .addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true))),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const configPath = path.join(__dirname, '../config.json');

    if (sub === 'painel') {
      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setTitle('🤝 Sistema de Parcerias')
        .setDescription('Quer fazer parceria com nosso servidor?\nClique no botão abaixo e preencha o formulário.\nNossa equipe analisará sua proposta o mais rápido possível.')
        .setFooter({ text: 'Parcerias' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('enviar_parceria').setLabel('Enviar Proposta').setStyle(ButtonStyle.Primary).setEmoji('📝')
      );

      await interaction.channel.send({ embeds: [embed], components: [row] });
      return interaction.reply({ content: '✅ Painel enviado!', ephemeral: true });
    }

    if (sub === 'logs') {
      client.config.logChannelId = interaction.options.getChannel('canal').id;
      fs.writeFileSync(configPath, JSON.stringify(client.config, null, 2));
      return interaction.reply({ content: '✅ Canal de logs definido.', ephemeral: true });
    }

    if (sub === 'staff') {
      client.config.staffRoleId = interaction.options.getRole('cargo').id;
      fs.writeFileSync(configPath, JSON.stringify(client.config, null, 2));
      return interaction.reply({ content: '✅ Cargo de staff definido.', ephemeral: true });
    }
  }
};
