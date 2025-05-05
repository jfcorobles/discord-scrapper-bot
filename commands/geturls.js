// commands/geturls.js
const { SlashCommandBuilder } = require('discord.js');
const { getUrls } = require('../database/db'); // Asegúrate de tener esta función en db.js

module.exports = {
  data: new SlashCommandBuilder()
    .setName('geturls')
    .setDescription('Muestra todas las URLs guardadas para este servidor y usuario'),

  async execute(interaction) {
    const userId = interaction.user.id;  // Obtiene el ID del usuario que ejecuta el comando
    const guildId = interaction.guildId;  // Obtiene el ID del servidor

    try {
      // Obtener las URLs guardadas para este usuario y servidor
      const urls = await getUrls(guildId, userId); // Aquí 'getUrls' debería devolver las URLs del usuario y servidor

      if (urls.length === 0) {
        await interaction.reply({ content: 'No tienes URLs guardadas en este servidor.', ephemeral: true });
        return;
      }

      // Crear un mensaje con las URLs
      let messageContent = 'Tus URLs guardadas:\n';
      urls.forEach((urlData, index) => {
        messageContent += `**${urlData.anime}** - ${urlData.url + (urlData.last_chapter - 1)} (Último capítulo: ${urlData.last_chapter - 1})\n`;
      });

      // Responder con el mensaje generado
      await interaction.reply({ content: messageContent, ephemeral: true });
    } catch (error) {
      console.error('Error al obtener las URLs:', error);
      await interaction.reply({ content: '❌ Hubo un error al obtener tus URLs.', ephemeral: true });
    }
  },
};
