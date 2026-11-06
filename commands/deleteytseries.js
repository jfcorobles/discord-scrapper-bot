const { SlashCommandBuilder } = require('discord.js');
const { getYoutubeSeries, deleteYoutubeSeriesById } = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteytseries')
        .setDescription('Elimina una serie de YouTube del monitoreo')
        .addIntegerOption(option =>
            option
                .setName('serie')
                .setDescription('Elige la serie a eliminar')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const guildId = interaction.guildId;

        try {
            const seriesList = await getYoutubeSeries(guildId);
            const choices = seriesList.map(s => ({
                name: `${s.series_name} (${s.channel_handle})`,
                value: s.id,
            }));

            const filtered = choices.filter(choice =>
                choice.name.toLowerCase().includes(focusedValue.toLowerCase())
            );

            await interaction.respond(filtered.slice(0, 25));
        } catch (err) {
            console.error('Error en autocompletado deleteytseries:', err);
        }
    },

    async execute(interaction) {
        const id = interaction.options.getInteger('serie');
        const guildId = interaction.guildId;

        try {
            const seriesList = await getYoutubeSeries(guildId);
            const toDelete = seriesList.find(s => s.id === id);

            if (!toDelete) {
                return await interaction.reply({
                    content: '❌ No se encontró esa serie de YouTube.',
                    ephemeral: true
                });
            }

            await deleteYoutubeSeriesById(id);
            await interaction.reply({
                content: `✅ Se eliminó **"${toDelete.series_name}"** (${toDelete.channel_handle}) del monitoreo.`,
                ephemeral: true
            });
        } catch (err) {
            console.error('Error al eliminar serie de YouTube:', err);
            await interaction.reply({
                content: '❌ Ocurrió un error al eliminar la serie de YouTube.',
                ephemeral: true
            });
        }
    }
};

