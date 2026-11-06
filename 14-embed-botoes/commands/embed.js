const { 
  SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, 
  PermissionFlagsBits, ChannelType 
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Cria um embed com botões personalizados')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(o => o.setName('titulo').setDescription('Título').setRequired(true))
    .addStringOption(o => o.setName('descricao').setDescription('Descrição').setRequired(true))
    .addStringOption(o => o.setName('cor').setDescription('Cor hex (ex: #5865F2)'))
    .addStringOption(o => o.setName('imagem').setDescription('URL da imagem'))
    .addChannelOption(o => o.setName('canal').setDescription('Canal de destino').addChannelTypes(ChannelType.GuildText))
    // Botão 1
    .addStringOption(o => o.setName('botao1_label').setDescription('Texto do botão 1'))
    .addStringOption(o => o.setName('botao1_url').setDescription('Link do botão 1'))
    // Botão 2
    .addStringOption(o => o.setName('botao2_label').setDescription('Texto do botão 2'))
    .addStringOption(o => o.setName('botao2_url').setDescription('Link do botão 2'))
    // Botão 3
    .addStringOption(o => o.setName('botao3_label').setDescription('Texto do botão 3'))
    .addStringOption(o => o.setName('botao3_url').setDescription('Link do botão 3'))
    // Botão 4
    .addStringOption(o => o.setName('botao4_label').setDescription('Texto do botão 4'))
    .addStringOption(o => o.setName('botao4_url').setDescription('Link do botão 4'))
    // Botão 5
    .addStringOption(o => o.setName('botao5_label').setDescription('Texto do botão 5'))
    .addStringOption(o => o.setName('botao5_url').setDescription('Link do botão 5')),

  async execute(interaction, client) {
    const titulo = interaction.options.getString('titulo');
    const descricao = interaction.options.getString('descricao');
    const cor = interaction.options.getString('cor') || client.config.embedColor;
    const imagem = interaction.options.getString('imagem');
    const canal = interaction.options.getChannel('canal') || interaction.channel;

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descricao)
      .setColor(cor)
      .setTimestamp();
    if (imagem) embed.setImage(imagem);

    const buttons = [];
    for (let i = 1; i <= 5; i++) {
      const label = interaction.options.getString(`botao${i}_label`);
      const url = interaction.options.getString(`botao${i}_url`);
      if (label && url) {
        buttons.push(
          new ButtonBuilder()
            .setLabel(label)
            .setStyle(ButtonStyle.Link)
            .setURL(url)
        );
      }
    }

    const components = [];
    if (buttons.length > 0) {
      // Discord permite no máximo 5 botões por row
      components.push(new ActionRowBuilder().addComponents(buttons.slice(0, 5)));
    }

    await canal.send({ embeds: [embed], components });
    await interaction.reply({ content: `✅ Embed enviado em ${canal}`, ephemeral: true });
  }
};
