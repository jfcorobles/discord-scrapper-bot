const { SlashCommandBuilder } = require('discord.js');
const { getUrls, updateLastChapter } = require('../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('updatechapter')
    .setDescription('Actualiza el capítulo de un anime guardado')
    .addStringOption(option =>
      option
        .setName('anime')
        .setDescription('Selecciona el anime que quieres actualizar')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option
        .setName('capitulo')
        .setDescription('Nuevo número de capítulo')
        .setRequired(true)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    try {
      const urls = await getUrls(guildId, userId);

      const filtered = urls
        .filter(entry => entry.anime.toLowerCase().includes(focused.toLowerCase()))
        .slice(0, 25)
        .map(entry => ({
          name: `${entry.anime} (Cap. ${entry.last_chapter})`,
          value: entry.id.toString() 
        }));

      await interaction.respond(filtered);
    } catch (err) {
      console.error('Error en autocomplete:', err);
      await interaction.respond([]);
    }
  },

  async execute(interaction) {
    const id = parseInt(interaction.options.getString('anime'));
    const newChapter = interaction.options.getString('capitulo');

    try {
      await updateLastChapter(id, newChapter);
      await interaction.reply({ content: `✅ Capítulo actualizado correctamente.`, ephemeral: true });
    } catch (err) {
      console.error('Error al actualizar capítulo:', err);
      await interaction.reply({ content: '❌ Error al actualizar el capítulo.', ephemeral: true });
    }
  }
};
