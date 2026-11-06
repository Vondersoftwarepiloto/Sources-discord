const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Envia um embed personalizado')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt => opt.setName('titulo').setDescription('Título do embed').setRequired(true))
    .addStringOption(opt => opt.setName('descricao').setDescription('Descrição do embed').setRequired(true))
    .addStringOption(opt => opt.setName('cor').setDescription('Cor em hex (ex: #5865F2)'))
    .addStringOption(opt => opt.setName('imagem').setDescription('URL da imagem'))
    .addStringOption(opt => opt.setName('thumbnail').setDescription('URL da thumbnail'))
    .addStringOption(opt => opt.setName('footer').setDescription('Texto do rodapé'))
    .addChannelOption(opt => opt.setName('canal').setDescription('Canal de destino').addChannelTypes(ChannelType.GuildText)),

  async execute(interaction, client) {
    const titulo = interaction.options.getString('titulo');
    const descricao = interaction.options.getString('descricao');
    const cor = interaction.options.getString('cor') || client.config.embedColor;
    const imagem = interaction.options.getString('imagem');
    const thumbnail = interaction.options.getString('thumbnail');
    const footer = interaction.options.getString('footer');
    const canal = interaction.options.getChannel('canal') || interaction.channel;

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descricao)
      .setColor(cor)
      .setTimestamp();

    if (imagem) embed.setImage(imagem);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (footer) embed.setFooter({ text: footer });

    await canal.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Embed enviado em ${canal}`, ephemeral: true });
  }
};
