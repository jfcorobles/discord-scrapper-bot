const cron = require('node-cron');
const { warOfCorpsesScrapper } = require('../scrapers/warOfCorpsesScrapper');
const { chainsawManScapper } = require('../scrapers/chainsawManScapper');
const { getUrls, updateLastChapter } = require('../database/db');
const { sendMessageToChannel } = require('../utils/message');
require('dotenv').config();

// Función para iniciar el trabajo diario
const scheduleDailyJob = (client) => {
  cron.schedule('* * * * *', async () => {
    console.log('Iniciando trabajo de scraping diario...');

    const urls = await getUrls(process.env.GUILD_ID);

    for (const urlData of urls) {
      const { id, url, anime, last_chapter, guild_id } = urlData;

      try {
        let newChapter = null;

        if (anime === 'Chainsaw Man') {
          newChapter = await chainsawManScapper(url, last_chapter);
        }

        if (anime === 'War of the Corpses') {
          newChapter = await warOfCorpsesScrapper(url, last_chapter);
        }

        if (newChapter) {
          const message = `¡Nuevo episodio disponible para **${anime}**! Capítulo ${newChapter}.\n${url}${newChapter}`;

          await sendMessageToChannel(client, guild_id, message);
          await updateLastChapter(id, parseInt(newChapter, 10) + 1);
        }
      } catch (error) {
        console.error(`Error al procesar la URL ${url}:`, error);
      }
    }

    console.log('Finalizando trabajo de scraping diario...');
  });
};

module.exports = { scheduleDailyJob };
