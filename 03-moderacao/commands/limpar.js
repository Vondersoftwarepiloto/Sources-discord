const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('limpar')
    .setDescription('Limpa mensagens do canal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt => opt.setName('quantidade').setDescription('Quantidade (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption(opt => opt.setName('usuario').setDescription('Limpar apenas de um usuário')),

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('quantidade');
    const user = interaction.options.getUser('usuario');

    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    let filtered = messages.filter(m => !m.pinned);
    if (user) filtered = filtered.filter(m => m.author.id === user.id);

    const toDelete = [...filtered.values()].slice(0, amount);
    const deleted = await interaction.channel.bulkDelete(toDelete, true);

    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setDescription(`🧹 **${deleted.size}** mensagens apagadas${user ? ` de ${user}` : ''}.`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
