const {
  ChannelType, PermissionFlagsBits, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const ticketsPath = path.join(__dirname, '../data/tickets.json');

function loadTickets() {
  if (!fs.existsSync(ticketsPath)) fs.writeFileSync(ticketsPath, '{}');
  return JSON.parse(fs.readFileSync(ticketsPath, 'utf8'));
}
function saveTickets(data) {
  fs.writeFileSync(ticketsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) {
        try { await command.execute(interaction, client); }
        catch (e) { console.error(e); await interaction.reply({ content: '❌ Erro.', ephemeral: true }); }
      }
      return;
    }

    const config = client.config;
    const tickets = loadTickets();

    // Select de categoria
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_ia_category') {
      const category = interaction.values[0];
      const categoryData = config.categories.find(c => c.value === category);

      await interaction.deferReply({ ephemeral: true });

      let ticketCategory = interaction.guild.channels.cache.find(
        c => c.name === config.ticketCategoryName && c.type === ChannelType.GuildCategory
      );
      if (!ticketCategory) {
        ticketCategory = await interaction.guild.channels.create({
          name: config.ticketCategoryName,
          type: ChannelType.GuildCategory,
          permissionOverwrites: [{ id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }]
        });
      }

      const channelName = `ticket-ia-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: ticketCategory.id,
        topic: `Ticket IA | ${interaction.user.tag} | ${categoryData?.label || category}`,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
          ...(config.staffRoleId ? [{ id: config.staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }] : [])
        ]
      });

      const ticketId = `${Date.now()}`;
      tickets[ticketId] = {
        channelId: channel.id,
        userId: interaction.user.id,
        category,
        open: true,
        aiEnabled: true,
        createdAt: new Date().toISOString()
      };
      saveTickets(tickets);

      const welcomeEmbed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle(`🤖 Ticket IA - ${categoryData?.label || category}`)
        .setDescription(config.welcomeMessage.replace('{user}', `<@${interaction.user.id}>`))
        .addFields(
          { name: 'Categoria', value: categoryData?.label || category, inline: true },
          { name: 'Modo IA', value: '🟢 Ativado', inline: true }
        )
        .setFooter({ text: `ID: ${ticketId}` })
        .setTimestamp();

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_ia_toggle').setLabel('Desativar IA').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
        new ButtonBuilder().setCustomId('ticket_ia_claim').setLabel('Assumir').setStyle(ButtonStyle.Primary).setEmoji('👤'),
        new ButtonBuilder().setCustomId('ticket_ia_close').setLabel('Fechar').setStyle(ButtonStyle.Danger).setEmoji('🔒')
      );

      await channel.send({
        content: `<@${interaction.user.id}>${config.staffRoleId ? ` | <@&${config.staffRoleId}>` : ''}`,
        embeds: [welcomeEmbed],
        components: [buttons]
      });

      await interaction.editReply({ content: `✅ Ticket criado: ${channel}` });
      return;
    }

    // Botões
    if (interaction.isButton()) {
      const ticketEntry = Object.entries(tickets).find(([_, t]) => t.channelId === interaction.channel.id);
      if (!ticketEntry) return;
      const [ticketId, ticket] = ticketEntry;

      if (interaction.customId === 'ticket_ia_toggle') {
        ticket.aiEnabled = !ticket.aiEnabled;
        saveTickets(tickets);
        await interaction.reply({
          content: ticket.aiEnabled ? '🟢 IA **ativada** neste ticket.' : '🔴 IA **desativada**. Apenas a staff responderá.',
          ephemeral: false
        });
        return;
      }

      if (interaction.customId === 'ticket_ia_claim') {
        ticket.claimedBy = interaction.user.id;
        ticket.aiEnabled = false;
        saveTickets(tickets);
        await interaction.reply({ content: `👤 Ticket assumido por <@${interaction.user.id}>. IA desativada.` });
        return;
      }

      if (interaction.customId === 'ticket_ia_close') {
        ticket.open = false;
        saveTickets(tickets);

        if (config.logChannelId) {
          const log = interaction.guild.channels.cache.get(config.logChannelId);
          if (log) {
            await log.send({
              embeds: [new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle('🔒 Ticket IA Fechado')
                .addFields(
                  { name: 'Canal', value: interaction.channel.name, inline: true },
                  { name: 'Fechado por', value: `<@${interaction.user.id}>`, inline: true },
                  { name: 'Aberto por', value: `<@${ticket.userId}>`, inline: true }
                )
                .setTimestamp()]
            });
          }
        }

        await interaction.reply({ content: '🔒 Fechando em 5 segundos...' });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      }
    }
  }
};
