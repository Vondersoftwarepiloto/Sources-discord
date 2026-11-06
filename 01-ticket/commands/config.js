const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configurações do bot de ticket')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('ver')
        .setDescription('Mostra as configurações atuais')
    )
    .addSubcommand(sub =>
      sub.setName('staff')
        .setDescription('Define o cargo de staff')
        .addRoleOption(opt => opt.setName('cargo').setDescription('Cargo da staff').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('logs')
        .setDescription('Define o canal de logs')
        .addChannelOption(opt => opt.setName('canal').setDescription('Canal de logs').setRequired(true))
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const configPath = path.join(__dirname, '../config.json');
    let config = client.config;

    if (sub === 'ver') {
      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle('⚙️ Configurações Atuais')
        .addFields(
          { name: 'Cor do Embed', value: config.embedColor, inline: true },
          { name: 'Cargo Staff', value: config.staffRoleId ? `<@&${config.staffRoleId}>` : 'Não definido', inline: true },
          { name: 'Canal de Logs', value: config.logChannelId ? `<#${config.logChannelId}>` : 'Não definido', inline: true },
          { name: 'Avaliação', value: config.ratingEnabled ? 'Ativada' : 'Desativada', inline: true },
          { name: 'Call de Voz', value: config.voiceChannelEnabled ? 'Ativada' : 'Desativada', inline: true },
          { name: 'Máx. tickets/usuário', value: String(config.maxTicketsPerUser), inline: true }
        );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'staff') {
      const role = interaction.options.getRole('cargo');
      config.staffRoleId = role.id;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      client.config = config;
      return interaction.reply({ content: `✅ Cargo de staff definido para ${role}.`, ephemeral: true });
    }

    if (sub === 'logs') {
      const channel = interaction.options.getChannel('canal');
      config.logChannelId = channel.id;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      client.config = config;
      return interaction.reply({ content: `✅ Canal de logs definido para ${channel}.`, ephemeral: true });
    }
  }
};
