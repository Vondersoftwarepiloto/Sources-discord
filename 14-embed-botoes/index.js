const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.config = require('./config.json');

for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

client.once('ready', () => console.log(`✅ Bot Embed+Botões online como ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction, client).catch(console.error);
  }

  // Botões de link já são tratados nativamente pelo Discord
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
