// utils/sendMessageToChannel.js

const { Client, GatewayIntentBits } = require('discord.js');

// Función para enviar un mensaje a un canal específico de un servidor
const sendMessageToChannel = async (client, guildId, message) => {
  try {
    // El cliente ya debería estar autenticado y listo desde el proceso principal
    const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId);

    if (!guild) {
      console.log(`Guild con ID ${guildId} no encontrado.`);
      return;
    }

    // Buscamos un canal de texto (puedes ajustar esto para que use un canal específico por ID en el futuro)
    const channel = guild.channels.cache.find(ch => ch.isTextBased());

    if (!channel) {
      console.log(`No se encontró un canal de texto en el servidor con ID ${guildId}`);
      return;
    }

    // Envía el mensaje al canal
    await channel.send(message);
    console.log(`✅ Mensaje enviado a ${channel.name}: ${message}`);
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
  }
};

module.exports = { sendMessageToChannel };
