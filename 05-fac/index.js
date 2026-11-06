const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.config = require('./config.json');

const dataPath = path.join(__dirname, 'data/fac.json');
function load() { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); }
function save(data) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2)); }

for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

client.once('ready', () => console.log(`✅ Bot de Fac online como ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction, client).catch(console.error);
    return;
  }

  const data = load();

  if (interaction.isButton() && interaction.customId === 'fac_registrar') {
    if (data.membros[interaction.user.id]) {
      return interaction.reply({ content: '❌ Você já está registrado na fac.', ephemeral: true });
    }
    data.membros[interaction.user.id] = {
      nome: interaction.user.username,
      registradoEm: new Date().toISOString(),
      farmSemana: 0
    };
    save(data);

    if (client.config.cargoMembroFac) {
      try { await interaction.member.roles.add(client.config.cargoMembroFac); } catch {}
    }

    await interaction.reply({ content: '✅ Você foi registrado na facção com sucesso!', ephemeral: true });
    return;
  }

  if (interaction.isButton() && interaction.customId === 'fac_farm') {
    if (!data.membros[interaction.user.id]) {
      return interaction.reply({ content: '❌ Você precisa se registrar primeiro.', ephemeral: true });
    }
    data.membros[interaction.user.id].farmSemana = (data.membros[interaction.user.id].farmSemana || 0) + 1;
    save(data);
    await interaction.reply({
      content: `🌾 Farm registrado! Total da semana: **${data.membros[interaction.user.id].farmSemana}**`,
      ephemeral: true
    });
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
