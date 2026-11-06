const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.config = require('./config.json');

for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  client.commands.set(require(`./commands/${file}`).data.name, require(`./commands/${file}`));
}

client.once('ready', () => console.log(`✅ Bot de Formulário online como ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction, client).catch(console.error);
    return;
  }

  if (interaction.isButton() && interaction.customId === 'abrir_formulario') {
    const perguntas = client.config.perguntas || [];
    const modal = new ModalBuilder().setCustomId('modal_formulario').setTitle('Formulário');

    // Discord limita a 5 campos por modal
    perguntas.slice(0, 5).forEach((pergunta, i) => {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(`p${i}`)
            .setLabel(pergunta.substring(0, 45))
            .setStyle(i === 2 || i === 3 ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setRequired(true)
        )
      );
    });

    await interaction.showModal(modal);
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'modal_formulario') {
    const perguntas = client.config.perguntas || [];
    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle('📩 Novo Formulário')
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    perguntas.slice(0, 5).forEach((pergunta, i) => {
      const resposta = interaction.fields.getTextInputValue(`p${i}`);
      embed.addFields({ name: pergunta, value: resposta || '—' });
    });

    const logId = client.config.logChannelId;
    const channel = logId ? interaction.guild.channels.cache.get(logId) : interaction.channel;
    await channel.send({ embeds: [embed] });

    await interaction.reply({ content: '✅ Formulário enviado com sucesso!', ephemeral: true });
  }
});

(async () => {
  const commands = fs.readdirSync('./commands').filter(f => f.endsWith('.js')).map(f => require(`./commands/${f}`).data.toJSON());
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  if (process.env.GUILD_ID) await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
  else await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  await client.login(process.env.TOKEN);
})();
