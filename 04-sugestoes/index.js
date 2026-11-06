const { Client, GatewayIntentBits, Collection, REST, Routes, Partials, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Reaction, Partials.User]
});

client.commands = new Collection();
client.config = require('./config.json');

for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

client.once('ready', () => console.log(`✅ Bot de Sugestões online como ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (command) await command.execute(interaction, client).catch(console.error);
});

// Reações para aprovar/rejeitar
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch().catch(() => null);
  if (!reaction.message.embeds[0]?.footer?.text?.startsWith('Sugestão')) return;

  const config = client.config;
  if (config.aprovacaoRoleId) {
    const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
    if (!member?.roles.cache.has(config.aprovacaoRoleId) && !member?.permissions.has('Administrator')) return;
  }

  const embed = reaction.message.embeds[0];
  if (reaction.emoji.name === '✅') {
    const newEmbed = EmbedBuilder.from(embed).setColor('#57F287').setFooter({ text: 'Sugestão APROVADA' });
    await reaction.message.edit({ embeds: [newEmbed] });
  } else if (reaction.emoji.name === '❌') {
    const newEmbed = EmbedBuilder.from(embed).setColor('#ED4245').setFooter({ text: 'Sugestão REJEITADA' });
    await reaction.message.edit({ embeds: [newEmbed] });
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
