const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configura o sistema de sugestões')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName('canal').setDescription('Define o canal de sugestões')
      .addChannelOption(o => o.setName('canal').setDescription('Canal').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(s => s.setName('cargo').setDescription('Cargo que pode aprovar/rejeitar')
      .addRoleOption(o => o.setName('cargo').setDescription('Cargo').setRequired(true)))
    .addSubcommand(s => s.setName('ver').setDescription('Ver configurações')),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const configPath = path.join(__dirname, '../config.json');
    let config = client.config;

    if (sub === 'canal') {
      config.sugestoesChannelId = interaction.options.getChannel('canal').id;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      client.config = config;
      return interaction.reply({ content: `✅ Canal de sugestões definido.`, ephemeral: true });
    }
    if (sub === 'cargo') {
      config.aprovacaoRoleId = interaction.options.getRole('cargo').id;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      client.config = config;
      return interaction.reply({ content: `✅ Cargo de aprovação definido.`, ephemeral: true });
    }
    if (sub === 'ver') {
      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle('⚙️ Configurações de Sugestões')
        .addFields(
          { name: 'Canal', value: config.sugestoesChannelId ? `<#${config.sugestoesChannelId}>` : 'Atual', inline: true },
          { name: 'Cargo Aprovação', value: config.aprovacaoRoleId ? `<@&${config.aprovacaoRoleId}>` : 'Admins', inline: true }
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
