const axios = require('axios');
const cheerio = require('cheerio');

const ytsScraper = async () => {
    try {
        console.log('Iniciando scraper de YTS...');

        const baseUrl = 'https://yts.gg';
        const url = `${baseUrl}/home`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                Accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            },
        });

        const $ = cheerio.load(response.data);
        const movies = [];

        // En yts.gg/home los elementos de películas se encuentran en .browse-movie-wrap
        // Seleccionamos las primeras 4 películas populares/recientes.
        $('.browse-movie-wrap').slice(0, 4).each((index, element) => {
            const titleElement = $(element).find('.browse-movie-title');
            const title = titleElement.text().trim() || "Título desconocido";

            // Enlace de la película
            const urlElement = $(element).find('a.browse-movie-link').first();
            let movieUrl = urlElement.attr('href');

            if (movieUrl && !movieUrl.startsWith('http')) {
                movieUrl = `${baseUrl}${movieUrl.startsWith('/') ? '' : '/'}${movieUrl}`;
            }

            // Imagen / póster
            const imgElement = $(element).find('img.img-responsive').first();
            let imageUrl = imgElement.attr('src');

            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }

            if (title !== "Título desconocido" && movieUrl) {
                movies.push({ title, url: movieUrl, image: imageUrl || null });
            }
        });

        console.log(`Scraper YTS finalizado. Películas encontradas: ${movies.length}`);
        return movies;

    } catch (error) {
        console.error('Error en el scraper de YTS:', error.message);
        return [];
    }
};

module.exports = { ytsScraper };
