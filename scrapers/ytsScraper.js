const axios = require('axios');
const cheerio = require('cheerio');

const ytsScraper = async () => {
    try {
        console.log('Iniciando scraper de YTS...');

        const url = 'https://yts.bz/';
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

        // YTS.bz puts popular downloads in specific divs. We need to check structure.
        // Usually, the popular downloads are in the first row-related class or a specific #popular-downloads div.
        // Assuming the class is `.browse-movie-wrap` inside the popular block.
        // We will select the first 4 browse-movie-wrap items.
        // Si no funciona, puede que necesitemos ajustar el selector. Las películas suelen ser devueltas bajo '.browse-movie-wrap' u otra clase similar.

        // En yts.mx / yts.bz la sección principal se llama "Populer Downloads" a veces y dentro hay items
        // Usaremos como heurística agarrar los 4 primeros items que parecen películas en el contenedor principal superior.

        $('.browse-movie-wrap').slice(0, 4).each((index, element) => {
            const titleElement = $(element).find('.browse-movie-title');
            const title = titleElement.text().trim() || "Título desconocido";

            // Link is usually an <a> wrapping the main struct or inside. Let's find an href.
            const urlElement = $(element).find('a.browse-movie-link').first();
            let movieUrl = urlElement.attr('href');

            if (movieUrl && !movieUrl.startsWith('http')) {
                movieUrl = `https://yts.bz${movieUrl.startsWith('/') ? '' : '/'}${movieUrl}`;
            }

            // Image is usually inside a figure or img tag with class img-responsive
            const imgElement = $(element).find('img.img-responsive').first();
            let imageUrl = imgElement.attr('src');

            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `https://yts.bz${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
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
