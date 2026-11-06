const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});
client.commands = new Collection();
client.config = require('./config.json');

for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

client.once('ready', () => console.log(`✅ Bot de Verificação online como ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction, client);
    return;
  }

  if (interaction.isButton() && interaction.customId === 'verificar') {
    const roleId = client.config.verifiedRoleId;
    if (!roleId) return interaction.reply({ content: '❌ Cargo de verificação não configurado.', ephemeral: true });

    const member = interaction.member;
    if (member.roles.cache.has(roleId)) {
      return interaction.reply({ content: '✅ Você já está verificado!', ephemeral: true });
    }

    try {
      await member.roles.add(roleId);
      await interaction.reply({ content: '✅ Você foi verificado com sucesso!', ephemeral: true });
    } catch {
      await interaction.reply({ content: '❌ Não foi possível atribuir o cargo. Verifique as permissões do bot.', ephemeral: true });
    }
  }
});

(async () => {
  const commands = [];
  for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
    commands.push(require(`./commands/${file}`).data.toJSON());
  }
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  if (process.env.GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
  } else {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  }
  await client.login(process.env.TOKEN);
})();
