const axios = require('axios');

/**
 * Obtiene los videos más recientes de un canal de YouTube a partir de su handle o URL.
 * Extrae tanto del formato moderno (lockupViewModel) como del clásico (videoRenderer).
 * 
 * @param {string} channelHandle - Handle del canal (ej: '@tigredebengala106' o 'tigredebengala106')
 * @returns {Promise<Array<{id: string, title: string, url: string, thumbnail: string|null}>>}
 */
const getChannelVideos = async (channelHandle = '@tigredebengala106') => {
    try {
        const cleanHandle = channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`;
        const url = `https://www.youtube.com/${cleanHandle}/videos`;

        console.log(`Iniciando scraper de YouTube para ${cleanHandle}...`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            },
            timeout: 15000,
        });

        const html = response.data;
        const jsonMatch = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/s);

        if (!jsonMatch) {
            console.error('No se pudo encontrar ytInitialData en la respuesta de YouTube.');
            return [];
        }

        const data = JSON.parse(jsonMatch[1]);
        const videos = [];
        const seenIds = new Set();

        function extractVideos(obj) {
            if (!obj || typeof obj !== 'object') return;

            // Formato moderno (lockupViewModel)
            if (obj.lockupViewModel) {
                const vm = obj.lockupViewModel;
                const videoId =
                    vm.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId ||
                    vm.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel?.animationActivationTargetId;

                const title =
                    vm.metadata?.lockupMetadataViewModel?.title?.content ||
                    vm.rendererContext?.accessibilityContext?.label;

                const thumbnail = vm.contentImage?.thumbnailViewModel?.image?.sources?.slice(-1)[0]?.url || null;

                if (videoId && title && !seenIds.has(videoId)) {
                    seenIds.add(videoId);
                    videos.push({
                        id: videoId,
                        title: title.trim(),
                        url: `https://www.youtube.com/watch?v=${videoId}`,
                        thumbnail: thumbnail,
                    });
                }
            }

            // Formato clásico (videoRenderer)
            if (obj.videoRenderer) {
                const vr = obj.videoRenderer;
                const videoId = vr.videoId;
                const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText;
                const thumbnail = vr.thumbnail?.thumbnails?.slice(-1)[0]?.url || null;

                if (videoId && title && !seenIds.has(videoId)) {
                    seenIds.add(videoId);
                    videos.push({
                        id: videoId,
                        title: title.trim(),
                        url: `https://www.youtube.com/watch?v=${videoId}`,
                        thumbnail: thumbnail,
                    });
                }
            }

            for (const key of Object.keys(obj)) {
                extractVideos(obj[key]);
            }
        }

        extractVideos(data);
        console.log(`Scraper YouTube finalizado para ${cleanHandle}. Videos extraídos: ${videos.length}`);
        return videos;
    } catch (error) {
        console.error('Error en el scraper de YouTube:', error.message);
        return [];
    }
};

/**
 * Filtra una lista de videos por palabras clave de una serie.
 * @param {Array} videos - Lista de videos extraídos
 * @param {string} seriesKeyword - Palabra clave de la serie (ej: "Dragon Ball BEERUS", "Elbaf")
 * @returns {Array} Videos que coinciden con la serie
 */
const filterVideosBySeries = (videos, seriesKeyword) => {
    if (!seriesKeyword || !seriesKeyword.trim()) return videos;

    const lowerKeyword = seriesKeyword.toLowerCase().trim();
    // Búsqueda flexible: si todas las palabras principales coinciden
    const keywords = lowerKeyword.split(/\s+/);

    return videos.filter((v) => {
        const titleLower = v.title.toLowerCase();
        return keywords.every((kw) => titleLower.includes(kw));
    });
};

module.exports = {
    getChannelVideos,
    filterVideosBySeries,
};

