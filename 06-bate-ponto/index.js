const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.config = require('./config.json');

const dataPath = path.join(__dirname, 'data/pontos.json');

function load() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}
function save(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

client.once('ready', () => console.log(`✅ Bot de Bate-Ponto online como ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction, client);
    return;
  }

  if (!interaction.isButton()) return;
  const pontos = load();
  const userId = interaction.user.id;
  const now = Date.now();

  if (interaction.customId === 'ponto_abrir') {
    if (pontos[userId]?.aberto) {
      return interaction.reply({ content: '❌ Você já tem um ponto aberto.', ephemeral: true });
    }
    pontos[userId] = { aberto: true, entrada: now, historico: pontos[userId]?.historico || [] };
    save(pontos);

    const embed = new EmbedBuilder()
      .setColor('#57F287')
      .setDescription(`🟢 **Ponto aberto** por <@${userId}>\nHorário: <t:${Math.floor(now/1000)}:F>`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.customId === 'ponto_fechar') {
    if (!pontos[userId]?.aberto) {
      return interaction.reply({ content: '❌ Você não tem um ponto aberto.', ephemeral: true });
    }
    const entrada = pontos[userId].entrada;
    const duracao = now - entrada;
    const horas = (duracao / 3600000).toFixed(2);

    pontos[userId].historico.push({ entrada, saida: now, horas: parseFloat(horas) });
    pontos[userId].aberto = false;
    delete pontos[userId].entrada;
    save(pontos);

    const totalHoras = pontos[userId].historico.reduce((a, b) => a + b.horas, 0).toFixed(2);

    const embed = new EmbedBuilder()
      .setColor('#ED4245')
      .setDescription(`🔴 **Ponto fechado** por <@${userId}>\nDuração desta sessão: **${horas}h**\nTotal acumulado: **${totalHoras}h**`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
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
