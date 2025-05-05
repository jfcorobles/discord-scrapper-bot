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

// Crear la tabla 'urls' si no existe
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

    db.run(query, (err) => {
        if (err) {
            console.error('Error al crear la tabla:', err.message);
        } else {
            console.log('Tabla "urls" creada o ya existe');
        }
    });
};

// Función para agregar una URL
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
                resolve(this.lastID); // Devuelve el ID de la nueva fila insertada
            }
        });
    });
};

// Función para obtener URLs en base a user_id y guild_id
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
                resolve(rows);  // Devuelve las URLs encontradas
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

// Llamar a la función para crear la tabla
createTable();

module.exports = {
    addUrl,
    getUrls,
    updateLastChapter,
    deleteUrlById
};
