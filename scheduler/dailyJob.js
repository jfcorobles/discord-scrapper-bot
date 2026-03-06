const cron = require('node-cron');
const { warOfCorpsesScrapper } = require('../scrapers/warOfCorpsesScrapper');
const { chainsawManScapper } = require('../scrapers/chainsawManScapper');
const { getUrls, updateLastChapter } = require('../database/db');
const { sendMessageToChannel } = require('../utils/message');
require('dotenv').config();

// Función para iniciar el trabajo diario
const scheduleDailyJob = (client) => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Iniciando trabajo de scraping diario...');

    const urls = await getUrls(process.env.GUILD_ID);

    for (const urlData of urls) {
      const { id, url, anime, last_chapter, guild_id } = urlData;

      try {
        let newChapters = null;

        if (anime === 'Chainsaw Man') {
          newChapters = await chainsawManScapper(url, last_chapter);
        }

        if (anime === 'War of the Corpses') {
          newChapters = await warOfCorpsesScrapper(url, last_chapter);
        }

        if (newChapters && Array.isArray(newChapters)) {
          for (const ch of newChapters) {
            const message = `¡Nuevo episodio disponible para **${anime}**! Capítulo ${ch}.\n${url}${ch}`;
            await sendMessageToChannel(client, guild_id, message);
            // Actualizamos la DB con el siguiente capítulo a buscar
            await updateLastChapter(id, parseInt(ch, 10) + 1);
          }
        }
      } catch (error) {
        console.error(`Error al procesar la URL ${url}:`, error);
      }
    }

    console.log('Finalizando trabajo de scraping diario...');
  });
};

module.exports = { scheduleDailyJob };
