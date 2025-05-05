# Discord Scraper Bot

Bot de Discord que realiza scraping diario en sitios web específicos y notifica en un canal si hay nuevos episodios disponibles. Usa `discord.js`, `node-cron`, `axios` y `sqlite3`.

## 📁 Estructura del proyecto
```bash
discord-scraper-bot/
├── commands/
│ └── addurl.js # Comando para agregar nuevas URLs
├── scrapers/
│ ├── warOfCorpsesScrapper.js # Scraper para "War of the Corpses"
│ └── chainsawManScrapper.js # Scraper para "Chainsaw Man"
├── database/
│ └── db.js # Manejo de SQLite
├── scheduler/
│ └── dailyJob.js # Tarea diaria de scraping
├── utils/
│ └── message.js # Envío de mensajes a canales de Discord
├── .env # Variables de entorno (no se sube al repo)
├── config.json # Configuración del bot
├── index.js # Entrada principal del bot
└── package.json
```
## ⚙️ Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/tu-usuario/discord-scraper-bot.git
cd discord-scraper-bot
```

2. Instala dependencias:
```bash
npm install
```
3. Crea un archivo .env con el token de tu bot:
```bash
DISCORD_TOKEN=tu_token_aquí
CLIENT_ID=tu_client_id_aquí
GUILD_ID=tu_guild_id_aquí
```

## 🚀 Uso
Inicia el bot:
```bash
node index.js
```

## 🧩 Comandos
/addurl — Agrega una nueva URL para scrapear, especificando nombre del anime y último capítulo.

## 🔧 Personalización
Puedes agregar más scrapers en el directorio /scrapers/, y definir qué función se debe usar por anime en dailyJob.js.

## 📅 Tareas programadas

El archivo scheduler/dailyJob.js está configurado con node-cron para ejecutarse cada minuto (para pruebas):
```bash
cron.schedule('* * * * *', async () => { ... });
```

Cámbialo a una hora fija para producción, por ejemplo:
```bash
cron.schedule('0 8 * * *', async () => { ... }); // 8 AM diario
```