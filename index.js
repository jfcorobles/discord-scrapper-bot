require('dotenv').config();  // Cargar variables de entorno desde el archivo .env
const { Client, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');  // Importar el módulo fs para leer archivos
const path = require('path');  // Para trabajar con rutas
const { scheduleDailyJob } = require('./scheduler/dailyJob');

// Crear un nuevo cliente de Discord con los permisos necesarios
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Crear un contenedor para los comandos
client.commands = new Map();

// Cuando el bot se haya iniciado
client.once(Events.ClientReady, async () => {
    console.log(`${client.user.tag} ha iniciado sesión en Discord`);

    // Iniciar el trabajo diario de scraping
    scheduleDailyJob(client);

    // Registrar los comandos
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commands = [];

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    // Obtener el guildId desde el archivo .env
    const guildId = process.env.GUILD_ID;

    // Registrar los comandos solo en el guild específico
    if (guildId) {
        try {
            const guild = client.guilds.cache.get(guildId);
            if (guild) {
                await guild.commands.set(commands);  // Registrar los comandos en el servidor específico
                console.log('Comandos registrados correctamente en el guild');
            } else {
                console.error(`No se encontró el guild con ID: ${guildId}`);
            }
        } catch (error) {
            console.error('Error al registrar los comandos en el guild:', error);
        }
    } else {
        console.error('No se ha configurado el GUILD_ID en el archivo .env');
    }

    console.log('Comandos cargados correctamente');
});

// Evento de interacción (comando de usuario)
client.on(Events.InteractionCreate, async (interaction) => {

    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command || !command.autocomplete) return;

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error('Error en autocompletado:', error);
        }
        return; // Evita seguir con el comando normal
    }


    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (client.commands.has(commandName)) {
        try {
            await client.commands.get(commandName).execute(interaction);
        } catch (error) {
            console.error('Error al ejecutar el comando:', error);
            await interaction.reply({ content: '❌ Hubo un error al ejecutar el comando.', ephemeral: true });
        }
    }
});

// Iniciar sesión en Discord con el token desde el archivo .env
client.login(process.env.DISCORD_TOKEN);
