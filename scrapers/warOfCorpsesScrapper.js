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
const warOfCorpsesScrapper = async (url, lastChapter) => {
    try {
        // Hacer una solicitud GET a la URL
        const ex = url + lastChapter;
        const { data } = await axios.get(url + lastChapter, {
            headers: {
                'User-Agent': 'Mozilla/5.0 ...',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.9',
                'Referer': 'https://google.com',
            }
        });

        // Cargar el HTML con Cheerio
        const $ = cheerio.load(data);

        // Buscar si el texto "This chapter is locked" está presente
        const lockedText = $('p').text().includes('This chapter is locked');

        // Si está bloqueado, retornamos null
        if (lockedText) {
            console.log('El capítulo está bloqueado.');
            return null;
        }

        // Devolver el número del capítulo disponible
        console.log(`Nuevo capítulo encontrado: Capítulo ${lastChapter}`);
        return lastChapter;

    } catch (error) {
        console.error('Error al scrapear el sitio:', error);
        return null;
    }
};

module.exports = {
    warOfCorpsesScrapper,
};
