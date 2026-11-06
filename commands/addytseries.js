const { SlashCommandBuilder } = require('discord.js');
const { addYoutubeSeries } = require('../database/db');
const { getChannelVideos, filterVideosBySeries } = require('../scrapers/youtubeScraper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addytseries')
        .setDescription('Agrega una serie de YouTube para monitoreo diario')
        .addStringOption(option =>
            option.setName('serie')
                .setDescription('Nombre o palabra clave de la serie (ej: Dragon Ball BEERUS)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('canal')
                .setDescription('Handle del canal (por defecto: @tigredebengala106)')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const series = interaction.options.getString('serie').trim();
        const rawChannel = interaction.options.getString('canal') || '@tigredebengala106';
        const channel = rawChannel.startsWith('@') ? rawChannel : `@${rawChannel}`;
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        try {
            // Buscamos si ya existe algún video de esa serie para guardar el último id
            const allVideos = await getChannelVideos(channel);
            const matches = filterVideosBySeries(allVideos, series);
            const lastVideoId = matches.length > 0 ? matches[0].id : null;

            await addYoutubeSeries(userId, guildId, channel, series, lastVideoId);

            let msg = `✅ Serie **"${series}"** de **${channel}** agregada al monitoreo automático.`;
            if (matches.length > 0) {
                msg += `\nÚltimo video detectado actualmente: **${matches[0].title}**`;
            } else {
                msg += `\n*(No se encontraron videos previos con ese nombre todavía, serás notificado cuando se publique el primero).*`;
            }

            await interaction.editReply({ content: msg });
        } catch (err) {
            console.error('Error al agregar serie de YouTube:', err);
            await interaction.editReply({ content: '❌ Hubo un error al guardar la serie de YouTube.' });
        }
    }
};

