const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Esta función toma la URL y el último capítulo registrado como parámetros
 * y devuelve el nuevo capítulo si hay uno disponible.
 * 
 * @param {string} url - La URL del sitio para scrapear.
 * @param {number} lastChapter - El número del último capítulo registrado.
 * @returns {number|null} El nuevo capítulo disponible, o null si no hay un nuevo capítulo.
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const warOfCorpsesScrapper = async (url, lastChapter) => {
    const foundChapters = [];
    let current = parseInt(lastChapter, 10);

    try {
        while (true) {
            console.log(`Verificando War of the Corpses: Capítulo ${current}...`);
            try {
                const { data } = await axios.get(url + current, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                        'Referer': 'https://qimanhwa.com/',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    },
                    timeout: 15000
                });

                const $ = cheerio.load(data);

                // Si el título contiene el nombre del anime y el capítulo, es que la página cargó
                const pageTitle = $('title').text().toLowerCase();
                const hasChapterInTitle = pageTitle.includes(`chapter ${current}`) || pageTitle.includes(`capítulo ${current}`);
                const isLocked = $('p').text().includes('This chapter is locked');

                if (hasChapterInTitle && !isLocked) {
                    console.log(`¡Capítulo ${current} encontrado y accesible!`);
                    foundChapters.push(current);
                    current++;

                    // Delay de 10 minutos antes de buscar el siguiente capítulo
                    console.log(`Esperando 10 minutos antes de buscar el capítulo ${current}...`);
                    await delay(10 * 60 * 1000);
                } else {
                    console.log(`Capítulo ${current} no válido o bloqueado.`);
                    break;
                }
            } catch (innerError) {
                if (innerError.response && innerError.response.status === 403) {
                    console.log(`Acceso denegado (403) para el capítulo ${current}. Posible protección anti-bot.`);
                } else {
                    console.log(`Error al acceder al capítulo ${current}: ${innerError.message}`);
                }
                break;
            }
        }
        return foundChapters.length > 0 ? foundChapters : null;
    } catch (error) {
        return foundChapters.length > 0 ? foundChapters : null;
    }
};

module.exports = {
    warOfCorpsesScrapper,
};
