const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});
client.commands = new Collection();
client.config = require('./config.json');
client.captchas = new Map(); // userId -> code

function generateCode(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

client.once('ready', () => console.log(`✅ Bot Captcha online como ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction, client).catch(console.error);
    return;
  }

  // Botão iniciar captcha
  if (interaction.isButton() && interaction.customId === 'iniciar_captcha') {
    const code = generateCode(client.config.captchaLength);
    client.captchas.set(interaction.user.id, code);

    const modal = new ModalBuilder()
      .setCustomId('modal_captcha')
      .setTitle('Verificação Captcha');

    const input = new TextInputBuilder()
      .setCustomId('codigo')
      .setLabel(`Digite o código: ${code}`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Digite o código acima')
      .setRequired(true)
      .setMaxLength(10);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
    return;
  }

  // Modal submit
  if (interaction.isModalSubmit() && interaction.customId === 'modal_captcha') {
    const codeDigitado = interaction.fields.getTextInputValue('codigo').toUpperCase().trim();
    const codeCorreto = client.captchas.get(interaction.user.id);

    if (!codeCorreto) {
      return interaction.reply({ content: '❌ Captcha expirado. Clique no botão novamente.', ephemeral: true });
    }

    if (codeDigitado !== codeCorreto) {
      client.captchas.delete(interaction.user.id);
      return interaction.reply({ content: '❌ Código incorreto. Tente novamente.', ephemeral: true });
    }

    client.captchas.delete(interaction.user.id);
    const roleId = client.config.verifiedRoleId;

    if (!roleId) {
      return interaction.reply({ content: '✅ Código correto! (Cargo não configurado)', ephemeral: true });
    }

    try {
      await interaction.member.roles.add(roleId);
      await interaction.reply({ content: '✅ Verificado com sucesso! Bem-vindo(a)!', ephemeral: true });
    } catch {
      await interaction.reply({ content: '✅ Código correto, mas não consegui atribuir o cargo. Contate a staff.', ephemeral: true });
    }
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
