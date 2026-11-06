# Discord Scraper Bot

Bot de Discord que realiza scraping periódico en sitios web específicos y canales de YouTube, notificando en Discord cuando hay nuevos episodios, películas o videos disponibles. Usa `discord.js`, `node-cron`, `axios`, `cheerio` y `sqlite3`.

## 📁 Estructura del proyecto
```bash
discord-scraper-bot/
├── commands/
│   ├── addurl.js           # Agrega una URL de manga/anime
│   ├── deleteurl.js        # Elimina una URL de manga/anime
│   ├── geturls.js          # Lista URLs de manga/anime
│   ├── updatechapter.js    # Actualiza el capítulo de un manga/anime
│   ├── checkyoutube.js     # Consulta videos o series de un canal al instante
│   ├── addytseries.js      # Agrega una serie de YouTube al monitoreo diario
│   ├── getytseries.js      # Lista las series de YouTube monitoreadas
│   └── deleteytseries.js   # Elimina una serie de YouTube del monitoreo
├── scrapers/
│   ├── chainsawManScapper.js  # Scraper para "Chainsaw Man"
│   ├── warOfCorpsesScrapper.js# Scraper para "War of the Corpses"
│   ├── ytsScraper.js          # Scraper de películas destacadas de YTS (yts.gg)
│   └── youtubeScraper.js      # Scraper de videos y series de YouTube
├── database/
│   ├── database.db         # Base de datos SQLite
│   └── db.js               # Conexión y operaciones CRUD en SQLite
├── scheduler/
│   └── dailyJob.js         # Tarea diaria programada de scraping y notificación
├── utils/
│   └── message.js          # Utilidad para envío de mensajes y embeds a canales
├── .env                    # Variables de entorno (no versionado)
├── index.js                # Entrada principal del bot
└── package.json
```

## ⚙️ Instalación

1. Clona este repositorio:
```bash
git clone https://github.com/jfcorobles/discord-scrapper-bot.git
cd discord-scraper-bot
```

2. Instala dependencias:
```bash
npm install
```

3. Crea un archivo `.env` con las variables de configuración:
```env
DISCORD_TOKEN=tu_token_aqui
CLIENT_ID=tu_client_id_aqui
GUILD_ID=tu_guild_id_aqui
```

## 🚀 Uso
Inicia el bot:
```bash
node index.js
```

O si usas **PM2**:
```bash
pm2 start index.js --name discord-scraper-bot
# O para reiniciar con cambios:
pm2 restart discord-scraper-bot
```

## 🧩 Comandos Slash

### Manga / Anime
* `/addurl` — Agrega una nueva URL para scrapear manga/anime.
* `/geturls` — Muestra las URLs guardadas.
* `/updatechapter` — Actualiza el número del último capítulo.
* `/deleteurl` — Elimina una URL guardada con autocompletado.

### YouTube
* `/checkyoutube` — Consulta al instante los últimos videos o busca una serie específica en un canal (por defecto `@tigredebengala106`).
* `/addytseries` — Registra una serie de un canal para recibir notificaciones automáticas cuando salga un nuevo video.
* `/getytseries` — Muestra las series de YouTube monitoreadas actualmente.
* `/deleteytseries` — Elimina una serie de YouTube del monitoreo con autocompletado.

## 📅 Tareas Programadas

El archivo `scheduler/dailyJob.js` está configurado con `node-cron` para ejecutarse todos los días a las 8:00 AM (`0 8 * * *`):
1. Revisa si hay nuevos capítulos de anime/manga.
2. Revisa nuevas películas populares en YTS.
3. Revisa si hay nuevos videos de las series suscritas de YouTube.
