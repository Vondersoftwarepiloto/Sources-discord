const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.config = require('./config.json');

for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

client.once('ready', () => console.log(`✅ Bot de Parcerias online como ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction, client).catch(console.error);
    return;
  }

  if (interaction.isButton() && interaction.customId === 'enviar_parceria') {
    const modal = new ModalBuilder().setCustomId('modal_parceria').setTitle('Proposta de Parceria');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('servidor').setLabel('Nome do seu servidor').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('membros').setLabel('Quantidade aproximada de membros').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('convite').setLabel('Link de convite').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('motivo').setLabel('Por que devemos fazer parceria?').setStyle(TextInputStyle.Paragraph).setRequired(true)
      )
    );

    await interaction.showModal(modal);
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'modal_parceria') {
    const servidor = interaction.fields.getTextInputValue('servidor');
    const membros = interaction.fields.getTextInputValue('membros');
    const convite = interaction.fields.getTextInputValue('convite');
    const motivo = interaction.fields.getTextInputValue('motivo');

    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle('🤝 Nova Proposta de Parceria')
      .addFields(
        { name: 'Servidor', value: servidor, inline: true },
        { name: 'Membros', value: membros, inline: true },
        { name: 'Convite', value: convite },
        { name: 'Motivo', value: motivo },
        { name: 'Enviado por', value: `${interaction.user.tag} (${interaction.user.id})` }
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`parceria_aceitar_${interaction.user.id}`).setLabel('Aceitar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`parceria_recusar_${interaction.user.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger)
    );

    const logId = client.config.logChannelId;
    const channel = logId ? interaction.guild.channels.cache.get(logId) : interaction.channel;

    await channel.send({
      content: client.config.staffRoleId ? `<@&${client.config.staffRoleId}>` : null,
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({ content: '✅ Sua proposta de parceria foi enviada com sucesso!', ephemeral: true });
    return;
  }

  if (interaction.isButton() && (interaction.customId.startsWith('parceria_aceitar_') || interaction.customId.startsWith('parceria_recusar_'))) {
    const aceito = interaction.customId.startsWith('parceria_aceitar_');
    const userId = interaction.customId.split('_').pop();

    const embed = EmbedBuilder.from(interaction.message.embeds[0])
      .setColor(aceito ? '#57F287' : '#ED4245')
      .setFooter({ text: aceito ? `✅ Aceita por ${interaction.user.tag}` : `❌ Recusada por ${interaction.user.tag}` });

    await interaction.update({ embeds: [embed], components: [] });

    try {
      const user = await client.users.fetch(userId);
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setColor(aceito ? '#57F287' : '#ED4245')
            .setTitle(aceito ? '✅ Parceria Aceita!' : '❌ Parceria Recusada')
            .setDescription(aceito
              ? `Sua proposta de parceria com **${interaction.guild.name}** foi **aceita**!`
              : `Sua proposta de parceria com **${interaction.guild.name}** foi **recusada**.`)
            .setTimestamp()
        ]
      });
    } catch {}
  }
});

(async () => {
  const commands = fs.readdirSync('./commands').filter(f => f.endsWith('.js')).map(f => require(`./commands/${f}`).data.toJSON());
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  if (process.env.GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
  } else {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  }
  await client.login(process.env.TOKEN);
})();
