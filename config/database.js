/**
 * Configuração de conexão com o banco de dados MySQL.
 * Utiliza um pool de conexões (mysql2/promise) com SSL.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Cria o pool de conexões com SSL desativado temporariamente (para desenvolvimento)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 11478,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false  // ← ESSENCIAL para evitar erro de certificado autoassinado
    }
});

/**
 * Testa a conexão ao iniciar.
 */
async function testarConexao() {
    try {
        const conexao = await pool.getConnection();
        console.log('✅ Conectado ao banco MySQL com sucesso!');
        conexao.release();
    } catch (erro) {
        console.error('❌ Falha na conexão:', erro.message);
    }
}

// Exporta o pool diretamente (sem desestruturação)
module.exports = pool;