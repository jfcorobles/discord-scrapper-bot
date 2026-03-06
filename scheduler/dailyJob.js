const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const { warOfCorpsesScrapper } = require('../scrapers/warOfCorpsesScrapper');
const { chainsawManScapper } = require('../scrapers/chainsawManScapper');
const { ytsScraper } = require('../scrapers/ytsScraper');
const { getUrls, updateLastChapter, getYtsMovies, replaceYtsMovies } = require('../database/db');
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

    // YTS Scraper logic
    try {
      console.log('Verificando películas de YTS...');
      const newYtsMovies = await ytsScraper();

      if (newYtsMovies && newYtsMovies.length > 0) {
        const oldYtsMovies = await getYtsMovies();

        // Compare new movies vs old movies by URL or Title
        const oldUrls = new Set(oldYtsMovies.map(m => m.url));
        const newMoviesFound = newYtsMovies.filter(m => !oldUrls.has(m.url));

        if (newMoviesFound.length > 0) {
          console.log(`Se encontraron ${newMoviesFound.length} nuevas películas de YTS.`);

          await sendMessageToChannel(client, process.env.GUILD_ID, `🎥 **¡Nuevas películas populares en YTS!** 🍿`);

          for (const m of newMoviesFound) {
            const embed = new EmbedBuilder()
              .setColor('#2ecc71')
              .setTitle(m.title)
              .setURL(m.url);

            if (m.image) {
              embed.setImage(m.image);
            }

            // Note: our generic sendMessageToChannel takes a string right now, we might need to change it or pass an object.
            // Let's pass the object directly and adjust utils/message.js if needed, or better yet since sendMessageToChannel uses channel.send(message),
            // we can pass the object directly to it: await channel.send(message) works with strings and embed objects.
            await sendMessageToChannel(client, process.env.GUILD_ID, { embeds: [embed] });
          }

          // Replace DB with new top 4
          await replaceYtsMovies(newYtsMovies);
          console.log('Base de datos de YTS actualizada.');
        } else {
          console.log('No hay nuevas películas en YTS. Las 4 populares son las mismas.');
        }
      }
    } catch (error) {
      console.error('Error al procesar YTS:', error);
    }

    console.log('Finalizando trabajo de scraping diario...');
  });
};

module.exports = { scheduleDailyJob };
