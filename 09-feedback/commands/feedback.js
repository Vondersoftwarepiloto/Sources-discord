const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('Sistema de feedback')
    .addSubcommand(s => s.setName('enviar')
      .setDescription('Envia um feedback')
      .addStringOption(o => o.setName('mensagem').setDescription('Seu feedback').setRequired(true))
      .addIntegerOption(o => o.setName('nota').setDescription('Nota de 1 a 5').setRequired(true).setMinValue(1).setMaxValue(5)))
    .addSubcommand(s => s.setName('config')
      .setDescription('Configurações (Admin)')
      .addChannelOption(o => o.setName('canal').setDescription('Canal de feedbacks').addChannelTypes(ChannelType.GuildText))
      .addRoleOption(o => o.setName('recompensa').setDescription('Cargo de recompensa'))
      .addIntegerOption(o => o.setName('minimo').setDescription('Mínimo de feedbacks para recompensa'))),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const dataPath = path.join(__dirname, '../data/feedbacks.json');
    const configPath = path.join(__dirname, '../config.json');
    let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    if (sub === 'enviar') {
      const mensagem = interaction.options.getString('mensagem');
      const nota = interaction.options.getInteger('nota');

      data[interaction.user.id] = data[interaction.user.id] || { total: 0, notas: [] };
      data[interaction.user.id].total++;
      data[interaction.user.id].notas.push(nota);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      const embed = new EmbedBuilder()
        .setColor(client.config.embedColor)
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setTitle(`⭐ Feedback (${nota}/5)`)
        .setDescription(mensagem)
        .setFooter({ text: `Total de feedbacks deste usuário: ${data[interaction.user.id].total}` })
        .setTimestamp();

      const channelId = client.config.feedbackChannelId || interaction.channel.id;
      const channel = interaction.guild.channels.cache.get(channelId) || interaction.channel;
      await channel.send({ embeds: [embed] });

      // Recompensa
      if (client.config.recompensaRoleId && data[interaction.user.id].total >= (client.config.minFeedbacks || 3)) {
        try {
          await interaction.member.roles.add(client.config.recompensaRoleId);
          await interaction.reply({ content: `✅ Feedback enviado! Você ganhou o cargo de recompensa por ter ${data[interaction.user.id].total} feedbacks.`, ephemeral: true });
          return;
        } catch {}
      }

      await interaction.reply({ content: '✅ Feedback enviado com sucesso!', ephemeral: true });
      return;
    }

    if (sub === 'config') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '❌ Apenas administradores.', ephemeral: true });
      }
      const canal = interaction.options.getChannel('canal');
      const role = interaction.options.getRole('recompensa');
      const minimo = interaction.options.getInteger('minimo');

      if (canal) client.config.feedbackChannelId = canal.id;
      if (role) client.config.recompensaRoleId = role.id;
      if (minimo) client.config.minFeedbacks = minimo;

      fs.writeFileSync(configPath, JSON.stringify(client.config, null, 2));
      await interaction.reply({ content: '✅ Configurações atualizadas.', ephemeral: true });
    }
  }
};
