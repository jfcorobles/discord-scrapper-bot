const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const { warOfCorpsesScrapper } = require('../scrapers/warOfCorpsesScrapper');
const { chainsawManScapper } = require('../scrapers/chainsawManScapper');
const { ytsScraper } = require('../scrapers/ytsScraper');
const { getChannelVideos, filterVideosBySeries } = require('../scrapers/youtubeScraper');
const {
  getUrls,
  updateLastChapter,
  getYtsMovies,
  replaceYtsMovies,
  getYoutubeSeries,
  updateYoutubeLastVideo,
  isYoutubeVideoNotified,
  markYoutubeVideoNotified,
} = require('../database/db');
const { sendMessageToChannel } = require('../utils/message');
require('dotenv').config();

// Función para iniciar el trabajo diario
const scheduleDailyJob = (client) => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Iniciando trabajo de scraping diario...');

    // 1. Scraping de Manga / Manhwa
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

    // 2. YTS Scraper logic
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

    // 3. YouTube Scraper logic
    try {
      console.log('Verificando series de YouTube...');
      const ytSeries = await getYoutubeSeries(process.env.GUILD_ID);

      if (ytSeries && ytSeries.length > 0) {
        // Agrupar por canal para minimizar peticiones
        const channelMap = new Map();
        for (const item of ytSeries) {
          if (!channelMap.has(item.channel_handle)) {
            channelMap.set(item.channel_handle, []);
          }
          channelMap.get(item.channel_handle).push(item);
        }

        for (const [channelHandle, seriesList] of channelMap.entries()) {
          const videos = await getChannelVideos(channelHandle);
          if (!videos || videos.length === 0) continue;

          for (const s of seriesList) {
            const matches = filterVideosBySeries(videos, s.series_name);
            if (matches.length === 0) continue;

            for (const v of matches) {
              const alreadyNotified = await isYoutubeVideoNotified(v.id);
              if (!alreadyNotified) {
                console.log(`¡Nuevo video encontrado para ${s.series_name}: ${v.title}!`);

                const embed = new EmbedBuilder()
                  .setColor('#FF0000')
                  .setTitle(v.title)
                  .setURL(v.url)
                  .setAuthor({
                    name: `YouTube: ${s.channel_handle}`,
                    url: `https://www.youtube.com/${s.channel_handle.startsWith('@') ? s.channel_handle : '@' + s.channel_handle}`
                  })
                  .setFooter({ text: `Serie monitoreada: ${s.series_name}` });

                if (v.thumbnail) {
                  embed.setImage(v.thumbnail);
                }

                await sendMessageToChannel(client, process.env.GUILD_ID, `🔴 **¡Nuevo video disponible para la serie "${s.series_name}"!** 🎬`);
                await sendMessageToChannel(client, process.env.GUILD_ID, { embeds: [embed] });

                await markYoutubeVideoNotified(v.id, s.series_name, v.title);
                await updateYoutubeLastVideo(s.id, v.id);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al procesar series de YouTube:', error);
    }

    console.log('Finalizando trabajo de scraping diario...');
  });
};

module.exports = { scheduleDailyJob };
