// utils/sendMessageToChannel.js

const { Client, GatewayIntentBits } = require('discord.js');

// Función para enviar un mensaje a un canal específico de un servidor
const sendMessageToChannel = async (client, guildId, message) => {
  try {
    // Obtén el cliente de Discord
   // const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

    // Asegúrate de que el bot está listo
    client.once('ready', () => {
      console.log('Bot listo para enviar mensajes...');
    });

    // Inicia sesión en el bot usando el token de tu archivo .env
    await client.login(process.env.DISCORD_TOKEN);

    // Encuentra el canal usando el guildId y el canal al que deseas enviar el mensaje
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      console.log(`Guild con ID ${guildId} no encontrado.`);
      return;
    }

    // En este caso, obtendremos el primer canal de texto del servidor
    const channel = guild.channels.cache.find(ch => ch.isTextBased());

    if (!channel) {
      console.log(`No se encontró un canal de texto en el servidor con ID ${guildId}`);
      return;
    }

    // Envía el mensaje al canal
    await channel.send(message);
    console.log(`Mensaje enviado a ${channel.name}: ${message}`);
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
  }
};

module.exports = { sendMessageToChannel };
