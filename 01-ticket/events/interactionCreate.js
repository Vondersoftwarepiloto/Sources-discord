const { 
  ChannelType, 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  StringSelectMenuBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const ticketsPath = path.join(__dirname, '../data/tickets.json');

function loadTickets() {
  if (!fs.existsSync(ticketsPath)) {
    fs.writeFileSync(ticketsPath, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(ticketsPath, 'utf8'));
}

function saveTickets(data) {
  fs.writeFileSync(ticketsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Comandos slash
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Ocorreu um erro ao executar este comando.', ephemeral: true });
      }
      return;
    }

    const config = client.config;
    const tickets = loadTickets();

    // Select menu de categorias
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
      const category = interaction.values[0];
      const categoryData = config.categories.find(c => c.value === category);

      // Verificar limite de tickets
      const userTickets = Object.values(tickets).filter(t => t.userId === interaction.user.id && t.open);
      if (userTickets.length >= (config.maxTicketsPerUser || 1)) {
        return interaction.reply({ content: '❌ Você já possui um ticket aberto.', ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      // Criar categoria se não existir
      let ticketCategory = interaction.guild.channels.cache.find(
        c => c.name === config.ticketCategoryName && c.type === ChannelType.GuildCategory
      );

      if (!ticketCategory) {
        ticketCategory = await interaction.guild.channels.create({
          name: config.ticketCategoryName,
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionFlagsBits.ViewChannel]
            }
          ]
        });
      }

      const channelName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: ticketCategory.id,
        topic: `Ticket de ${interaction.user.tag} | Categoria: ${categoryData?.label || category}`,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles]
          },
          ...(config.staffRoleId ? [{
            id: config.staffRoleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels]
          }] : [])
        ]
      });

      const ticketId = `${Date.now()}`;
      tickets[ticketId] = {
        channelId: channel.id,
        userId: interaction.user.id,
        category: category,
        open: true,
        claimedBy: null,
        createdAt: new Date().toISOString()
      };
      saveTickets(tickets);

      const welcomeEmbed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(`🎫 Ticket - ${categoryData?.label || category}`)
        .setDescription(config.welcomeMessage.replace('{user}', `<@${interaction.user.id}>`))
        .addFields(
          { name: 'Categoria', value: categoryData?.label || category, inline: true },
          { name: 'Aberto por', value: `<@${interaction.user.id}>`, inline: true }
        )
        .setFooter({ text: `ID: ${ticketId}` })
        .setTimestamp();

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_claim')
          .setLabel('Assumir')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('👤'),
        new ButtonBuilder()
          .setCustomId('ticket_voice')
          .setLabel('Criar Call')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔊'),
        new ButtonBuilder()
          .setCustomId('ticket_notify')
          .setLabel('Notificar Membro')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔔'),
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('Fechar')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

      await channel.send({
        content: `<@${interaction.user.id}>${config.staffRoleId ? ` | <@&${config.staffRoleId}>` : ''}`,
        embeds: [welcomeEmbed],
        components: [buttons]
      });

      await interaction.editReply({ content: `✅ Seu ticket foi criado: ${channel}` });
      return;
    }

    // Botões do ticket
    if (interaction.isButton()) {
      const channelId = interaction.channel.id;
      const ticketEntry = Object.entries(tickets).find(([_, t]) => t.channelId === channelId);
      if (!ticketEntry) return;

      const [ticketId, ticket] = ticketEntry;

      // Assumir ticket
      if (interaction.customId === 'ticket_claim') {
        if (ticket.claimedBy) {
          return interaction.reply({ content: `❌ Este ticket já foi assumido por <@${ticket.claimedBy}>.`, ephemeral: true });
        }

        ticket.claimedBy = interaction.user.id;
        saveTickets(tickets);

        const embed = new EmbedBuilder()
          .setColor(config.embedColor)
          .setDescription(`👤 Ticket assumido por <@${interaction.user.id}>`)
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        return;
      }

      // Criar canal de voz
      if (interaction.customId === 'ticket_voice') {
        if (!config.voiceChannelEnabled) {
          return interaction.reply({ content: '❌ Criação de call desativada.', ephemeral: true });
        }

        const voiceChannel = await interaction.guild.channels.create({
          name: `🔊-${interaction.channel.name}`,
          type: ChannelType.GuildVoice,
          parent: interaction.channel.parentId,
          permissionOverwrites: interaction.channel.permissionOverwrites.cache.map(p => ({
            id: p.id,
            allow: p.allow.toArray(),
            deny: p.deny.toArray()
          }))
        });

        await interaction.reply({ content: `✅ Canal de voz criado: ${voiceChannel}` });
        return;
      }

      // Notificar membro
      if (interaction.customId === 'ticket_notify') {
        try {
          const user = await client.users.fetch(ticket.userId);
          await user.send({
            embeds: [
              new EmbedBuilder()
                .setColor(config.embedColor)
                .setTitle('🔔 Notificação de Ticket')
                .setDescription(`Você tem uma atualização no seu ticket: ${interaction.channel}\nServidor: **${interaction.guild.name}**`)
                .setTimestamp()
            ]
          });
          await interaction.reply({ content: '✅ Membro notificado no privado.', ephemeral: true });
        } catch {
          await interaction.reply({ content: '❌ Não foi possível enviar DM para o membro.', ephemeral: true });
        }
        return;
      }

      // Fechar ticket
      if (interaction.customId === 'ticket_close') {
        const confirmRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_close_confirm')
            .setLabel('Confirmar Fechamento')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('ticket_close_cancel')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
          content: '⚠️ Tem certeza que deseja fechar este ticket?',
          components: [confirmRow],
          ephemeral: true
        });
        return;
      }

      if (interaction.customId === 'ticket_close_cancel') {
        await interaction.update({ content: '❌ Fechamento cancelado.', components: [] });
        return;
      }

      if (interaction.customId === 'ticket_close_confirm') {
        ticket.open = false;
        saveTickets(tickets);

        // Avaliação
        if (config.ratingEnabled) {
          try {
            const user = await client.users.fetch(ticket.userId);
            const ratingRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`rate_1_${ticketId}`).setLabel('1').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
              new ButtonBuilder().setCustomId(`rate_2_${ticketId}`).setLabel('2').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
              new ButtonBuilder().setCustomId(`rate_3_${ticketId}`).setLabel('3').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
              new ButtonBuilder().setCustomId(`rate_4_${ticketId}`).setLabel('4').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
              new ButtonBuilder().setCustomId(`rate_5_${ticketId}`).setLabel('5').setStyle(ButtonStyle.Secondary).setEmoji('⭐')
            );

            await user.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(config.embedColor)
                  .setTitle('⭐ Avalie o atendimento')
                  .setDescription('Como foi o atendimento do seu ticket? Clique em uma estrela de 1 a 5.')
              ],
              components: [ratingRow]
            });
          } catch {}
        }

        // Log
        if (config.logChannelId) {
          const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle('🔒 Ticket Fechado')
              .addFields(
                { name: 'Canal', value: interaction.channel.name, inline: true },
                { name: 'Fechado por', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Aberto por', value: `<@${ticket.userId}>`, inline: true },
                { name: 'Categoria', value: ticket.category, inline: true },
                { name: 'Assumido por', value: ticket.claimedBy ? `<@${ticket.claimedBy}>` : 'Ninguém', inline: true }
              )
              .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
          }
        }

        await interaction.update({ content: '🔒 Fechando ticket em 5 segundos...', components: [] });
        setTimeout(async () => {
          try {
            await interaction.channel.delete();
          } catch {}
        }, 5000);
        return;
      }

      // Avaliação
      if (interaction.customId.startsWith('rate_')) {
        const [, stars, tid] = interaction.customId.split('_');
        if (config.logChannelId) {
          const logChannel = interaction.client.channels.cache.get(config.logChannelId);
          if (logChannel) {
            await logChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor('#57F287')
                  .setTitle('⭐ Nova Avaliação')
                  .setDescription(`**${stars} estrela(s)** por <@${interaction.user.id}>\nTicket ID: \`${tid}\``)
                  .setTimestamp()
              ]
            });
          }
        }
        await interaction.update({ content: `✅ Obrigado pela avaliação de **${stars} estrela(s)**!`, components: [] });
        return;
      }
    }
  }
};
