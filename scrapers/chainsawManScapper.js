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
const chainsawManScapper = async (url, lastChapter) => {
    try {
        // Hacer una solicitud GET a la URL
        const { data } = await axios.get(new URL(url).origin + '/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 ...',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9',
                'Referer': 'https://google.com',
            }
        });

        // Cargar el HTML con Cheerio
        const $ = cheerio.load(data);

        const chapterList = $('#Chapters_List ul li a');
        if (!chapterList.length) return null;

        // El primer <a> en esa lista es el capítulo más nuevo
        const firstChapter = chapterList.first();
        const chapterTitle = firstChapter.text().trim();

        // Extraer número del capítulo
        const match = chapterTitle.match(/Chapter (\d+)/i);
        const chapterNumber = match ? parseInt(match[1], 10) : null;

        if (!chapterNumber || chapterNumber != lastChapter)
            return null;

        // Devolver el número del capítulo disponible
        console.log(`Nuevo capítulo encontrado: Capítulo ${lastChapter}`);
        return lastChapter;

    } catch (error) {
        console.error('Error al scrapear el sitio:', error);
        return null;
    }
};

module.exports = {
    chainsawManScapper,
};
