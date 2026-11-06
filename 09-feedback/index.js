const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.config = require('./config.json');

const dataPath = path.join(__dirname, 'data/feedbacks.json');
function load() { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); }
function save(d) { fs.writeFileSync(dataPath, JSON.stringify(d, null, 2)); }

for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  client.commands.set(require(`./commands/${file}`).data.name, require(`./commands/${file}`));
}

client.once('ready', () => console.log(`✅ Bot de Feedback online como ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (command) await command.execute(interaction, client).catch(console.error);
});

(async () => {
  const commands = fs.readdirSync('./commands').filter(f => f.endsWith('.js')).map(f => require(`./commands/${f}`).data.toJSON());
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  if (process.env.GUILD_ID) await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
  else await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  await client.login(process.env.TOKEN);
})();
