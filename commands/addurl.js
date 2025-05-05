// commands/addurl.js
const { SlashCommandBuilder } = require('discord.js');
const { addUrl } = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addurl')
        .setDescription('Guarda una nueva URL para scrapear')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('La URL a scrapear')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('anime')
                .setDescription('Identificador del anime (ej: exampleAnime)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('capitulo')
                .setDescription('Último capitulo registrado')
                .setRequired(true)),

    async execute(interaction) {
        const url = interaction.options.getString('url');
        const anime = interaction.options.getString('anime');
        const chapter = interaction.options.getString('capitulo');
        const userId = interaction.user.id;
        const guildId = interaction.guildId;

        try {
            await addUrl(userId, guildId, url, anime, chapter);
            await interaction.reply({ content: `✅ URL guardada correctamente para el anime **${anime}**.`, ephemeral: true });
        } catch (err) {
            console.error('Error al guardar URL:', err);
            await interaction.reply({ content: '❌ Hubo un error al guardar la URL.', ephemeral: true });
        }
    },
};
