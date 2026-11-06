const { SlashCommandBuilder } = require('discord.js');
const { getYoutubeSeries } = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getytseries')
        .setDescription('Muestra las series de YouTube monitoreadas en este servidor'),

    async execute(interaction) {
        const guildId = interaction.guildId;

        try {
            const seriesList = await getYoutubeSeries(guildId);

            if (!seriesList || seriesList.length === 0) {
                return await interaction.reply({
                    content: 'ℹ️ No hay series de YouTube monitoreadas actualmente en este servidor. Usa `/addytseries` para agregar una.',
                    ephemeral: true
                });
            }

            let message = '📺 **Series de YouTube en monitoreo automático:**\n\n';
            seriesList.forEach((s) => {
                message += `• **${s.series_name}** | Canal: \`${s.channel_handle}\` (ID: \`${s.id}\`)\n`;
            });

            await interaction.reply({ content: message, ephemeral: true });
        } catch (error) {
            console.error('Error al obtener series de YouTube:', error);
            await interaction.reply({ content: '❌ Ocurrió un error al obtener las series de YouTube.', ephemeral: true });
        }
    }
};

