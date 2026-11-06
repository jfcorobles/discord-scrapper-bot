const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getChannelVideos, filterVideosBySeries } = require('../scrapers/youtubeScraper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkyoutube')
        .setDescription('Verifica los videos recientes o de una serie en un canal de YouTube')
        .addStringOption(option =>
            option.setName('serie')
                .setDescription('Nombre o palabra clave de la serie (ej: Dragon Ball BEERUS, Elbaf)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('canal')
                .setDescription('Handle del canal (por defecto: @tigredebengala106)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        const channel = interaction.options.getString('canal') || '@tigredebengala106';
        const series = interaction.options.getString('serie');

        try {
            const allVideos = await getChannelVideos(channel);

            if (!allVideos || allVideos.length === 0) {
                return await interaction.editReply({
                    content: `❌ No se pudieron obtener videos del canal **${channel}**. Verifica que el handle sea correcto.`
                });
            }

            let results = allVideos;
            if (series) {
                results = filterVideosBySeries(allVideos, series);
            }

            if (results.length === 0) {
                return await interaction.editReply({
                    content: `🔍 No se encontraron videos que coincidan con la serie **"${series}"** en el canal **${channel}**.\n\n*Últimos videos disponibles en el canal:*\n` +
                        allVideos.slice(0, 3).map(v => `• [${v.title}](${v.url})`).join('\n')
                });
            }

            // Mostramos hasta 5 videos encontrados
            const topVideos = results.slice(0, 5);
            const embeds = topVideos.map((v, i) => {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle(v.title)
                    .setURL(v.url)
                    .setAuthor({ name: `YouTube: ${channel}`, url: `https://www.youtube.com/${channel.startsWith('@') ? channel : '@' + channel}` })
                    .setFooter({ text: `Video ${i + 1} de ${results.length} encontrado(s)` });

                if (v.thumbnail) {
                    embed.setImage(v.thumbnail);
                }

                return embed;
            });

            const headerText = series
                ? `📺 **Videos encontrados para la serie "${series}" en ${channel}:** (${results.length} coincidencias)`
                : `📺 **Últimos videos de ${channel}:**`;

            await interaction.editReply({
                content: headerText,
                embeds: embeds
            });

        } catch (error) {
            console.error('Error al ejecutar checkyoutube:', error);
            await interaction.editReply({ content: '❌ Ocurrió un error al consultar los videos de YouTube.' });
        }
    }
};

