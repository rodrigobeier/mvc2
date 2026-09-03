require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 11478,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false   // Essencial para Aiven
    },
    connectTimeout: 10000           // Timeout de 10s
});

// Teste de conexão na inicialização
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('Conectado ao banco com sucesso!');
        conn.release();
    } catch (err) {
        console.error('Falha na conexão:', err.message);
    }
})();

module.exports = pool;