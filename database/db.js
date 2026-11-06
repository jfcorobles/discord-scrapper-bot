const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Definir la ruta de la base de datos
const dbPath = path.join(__dirname, 'database.db');

// Crear o abrir la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});

// Crear tablas si no existen
const createTable = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      url TEXT NOT NULL,
      anime TEXT NOT NULL,
      last_chapter TEXT NOT NULL
    )
  `;

    const queryYts = `
    CREATE TABLE IF NOT EXISTS yts_movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        image TEXT
    )
    `;

    const queryYtSeries = `
    CREATE TABLE IF NOT EXISTS youtube_series (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        channel_handle TEXT NOT NULL,
        series_name TEXT NOT NULL,
        last_video_id TEXT
    )
    `;

    const queryYtNotified = `
    CREATE TABLE IF NOT EXISTS youtube_notified_videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_id TEXT UNIQUE NOT NULL,
        series_name TEXT,
        title TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `;

    db.run(query, (err) => {
        if (err) {
            console.error('Error al crear la tabla urls:', err.message);
        } else {
            console.log('Tabla "urls" creada o ya existe');
        }
    });

    db.run(queryYts, (err) => {
        if (err) {
            console.error('Error al crear la tabla yts_movies:', err.message);
        } else {
            console.log('Tabla "yts_movies" creada o ya existe');
            db.run(`ALTER TABLE yts_movies ADD COLUMN image TEXT`, () => {});
        }
    });

    db.run(queryYtSeries, (err) => {
        if (err) {
            console.error('Error al crear la tabla youtube_series:', err.message);
        } else {
            console.log('Tabla "youtube_series" creada o ya existe');
        }
    });

    db.run(queryYtNotified, (err) => {
        if (err) {
            console.error('Error al crear la tabla youtube_notified_videos:', err.message);
        } else {
            console.log('Tabla "youtube_notified_videos" creada o ya existe');
        }
    });
};

// Función para agregar una URL de manga/anime
const addUrl = (userId, guildId, url, anime, chapter) => {
    return new Promise((resolve, reject) => {
        const query = `
      INSERT INTO urls (user_id, guild_id, url, anime, last_chapter)
      VALUES (?, ?, ?, ?, ?)
    `;

        db.run(query, [userId, guildId, url, anime, chapter], function (err) {
            if (err) {
                console.error('Error al insertar URL:', err.message);
                reject(err);
            } else {
                console.log(`URL guardada correctamente: ${anime} - ${url}`);
                resolve(this.lastID);
            }
        });
    });
};

// Función para obtener URLs en base a guild_id
const getUrls = (guildId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM urls 
            WHERE guild_id = ?
        `;

        db.all(query, [guildId], (err, rows) => {
            if (err) {
                console.error('Error al obtener las URLs:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const updateLastChapter = (id, newChapter) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE urls
        SET last_chapter = ?
        WHERE id = ?
      `;

        db.run(query, [newChapter, id], function (err) {
            if (err) {
                console.error('Error al actualizar el capítulo:', err.message);
                reject(err);
            } else {
                console.log(`Capítulo actualizado a ${newChapter}`);
                resolve();
            }
        });
    });
};

const deleteUrlById = (id) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM urls WHERE id = ?`;
        db.run(query, [id], function (err) {
            if (err) {
                console.error('Error al eliminar URL:', err.message);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Llamar a la función para crear tablas
createTable();

// Funciones para YTS
const getYtsMovies = () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM yts_movies`;
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error al obtener las películas de YTS:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const replaceYtsMovies = (movies) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`DELETE FROM yts_movies`, (err) => {
                if (err) {
                    console.error('Error al eliminar películas anteriores:', err.message);
                    return reject(err);
                }
            });

            const stmt = db.prepare(`INSERT INTO yts_movies (title, url, image) VALUES (?, ?, ?)`);
            movies.forEach((movie) => {
                stmt.run(movie.title, movie.url, movie.image);
            });
            stmt.finalize((err) => {
                if (err) {
                    console.error('Error al insertar nuevas películas:', err.message);
                    return reject(err);
                }
                resolve();
            });
        });
    });
};

// Funciones para YouTube
const addYoutubeSeries = (userId, guildId, channelHandle, seriesName, lastVideoId = null) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO youtube_series (user_id, guild_id, channel_handle, series_name, last_video_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.run(query, [userId, guildId, channelHandle, seriesName, lastVideoId], function (err) {
            if (err) {
                console.error('Error al guardar serie de YouTube:', err.message);
                reject(err);
            } else {
                console.log(`Serie de YouTube registrada: ${seriesName} (${channelHandle})`);
                resolve(this.lastID);
            }
        });
    });
};

const getYoutubeSeries = (guildId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM youtube_series WHERE guild_id = ?`;
        db.all(query, [guildId], (err, rows) => {
            if (err) {
                console.error('Error al obtener series de YouTube:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const deleteYoutubeSeriesById = (id) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM youtube_series WHERE id = ?`;
        db.run(query, [id], function (err) {
            if (err) {
                console.error('Error al eliminar serie de YouTube:', err.message);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const updateYoutubeLastVideo = (id, lastVideoId) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE youtube_series SET last_video_id = ? WHERE id = ?`;
        db.run(query, [lastVideoId, id], function (err) {
            if (err) {
                console.error('Error al actualizar último video de YouTube:', err.message);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const isYoutubeVideoNotified = (videoId) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT id FROM youtube_notified_videos WHERE video_id = ?`;
        db.get(query, [videoId], (err, row) => {
            if (err) {
                console.error('Error al verificar video de YouTube notificado:', err.message);
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
};

const markYoutubeVideoNotified = (videoId, seriesName, title) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT OR IGNORE INTO youtube_notified_videos (video_id, series_name, title)
            VALUES (?, ?, ?)
        `;
        db.run(query, [videoId, seriesName, title], function (err) {
            if (err) {
                console.error('Error al marcar video de YouTube como notificado:', err.message);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports = {
    addUrl,
    getUrls,
    updateLastChapter,
    deleteUrlById,
    getYtsMovies,
    replaceYtsMovies,
    addYoutubeSeries,
    getYoutubeSeries,
    deleteYoutubeSeriesById,
    updateYoutubeLastVideo,
    isYoutubeVideoNotified,
    markYoutubeVideoNotified,
};
