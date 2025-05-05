// commands/deleteurl.js
const { SlashCommandBuilder } = require('discord.js');
const { getUrls, deleteUrlById } = require('../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteurl')
    .setDescription('Elimina una URL guardada')
    .addIntegerOption(option =>
      option
        .setName('anime')
        .setDescription('Elige el anime de la URL a eliminar')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    try {
      const urls = await getUrls(guildId, userId);
      const choices = urls.map(url => ({
        name: `${url.anime} (ID: ${url.id})`,
        value: url.id,
      }));

      const filtered = choices.filter(choice =>
        choice.name.toLowerCase().includes(focusedValue.toLowerCase())
      );

      await interaction.respond(filtered.slice(0, 25));
    } catch (err) {
      console.error('Error en autocompletado deleteurl:', err);
    }
  },

  async execute(interaction) {
    const id = interaction.options.getInteger('anime');
    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    try {
      const urls = await getUrls(guildId, userId);
      const urlToDelete = urls.find(u => u.id === id);

      if (!urlToDelete) {
        await interaction.reply({ content: '❌ No se encontró una URL con ese ID.', ephemeral: true });
        return;
      }

      await deleteUrlById(id);
      await interaction.reply({ content: `✅ Se eliminó la URL del anime **${urlToDelete.anime}** (ID ${id}).`, ephemeral: true });
    } catch (err) {
      console.error('Error al eliminar URL:', err);
      await interaction.reply({ content: '❌ Ocurrió un error al eliminar la URL.', ephemeral: true });
    }
  },
};
