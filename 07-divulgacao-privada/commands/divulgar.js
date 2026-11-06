const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('divulgar')
    .setDescription('Envia uma mensagem via DM para todos os membros (use com responsabilidade)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('mensagem').setDescription('Mensagem a ser enviada').setRequired(true)),

  async execute(interaction, client) {
    const mensagem = interaction.options.getString('mensagem');
    const delay = client.config.delayBetweenDMs || 1500;

    await interaction.reply({
      content: '⚠️ **Aviso importante**\nO envio de DM em massa pode resultar em bloqueio do bot ou da conta pelo Discord.\nIniciando envio em 3 segundos... Use apenas para comunicados legítimos.',
      ephemeral: true
    });

    await new Promise(r => setTimeout(r, 3000));

    const members = await interaction.guild.members.fetch();
    let enviados = 0;
    let falhas = 0;

    const statusMsg = await interaction.followUp({ content: `📤 Enviando... 0/${members.size}`, ephemeral: true });

    for (const [, member] of members) {
      if (member.user.bot) continue;
      try {
        await member.send({
          embeds: [
            new EmbedBuilder()
              .setColor(client.config.embedColor)
              .setTitle(`📢 Comunicado - ${interaction.guild.name}`)
              .setDescription(mensagem)
              .setFooter({ text: `Enviado por ${interaction.user.tag}` })
              .setTimestamp()
          ]
        });
        enviados++;
      } catch {
        falhas++;
      }

      if ((enviados + falhas) % 10 === 0) {
        await statusMsg.edit({ content: `📤 Enviando... ${enviados + falhas}/${members.size}` }).catch(() => {});
      }

      await new Promise(r => setTimeout(r, delay));
    }

    await statusMsg.edit({
      content: `✅ Concluído!\nEnviados: **${enviados}**\nFalhas (DM fechada/bloqueada): **${falhas}**`
    });
  }
};
