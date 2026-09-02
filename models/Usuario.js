const pool = require('../config/database');

const Usuario = {
    async buscarPorEmail(email) {
        const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows[0] || null;
    },

    async criar(nome, email, senhaHash, tipo) {
        const [result] = await pool.execute(
            'INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, tipo]
        );
        return result.insertId;
    },

    async buscarPorId(id) {
        const [rows] = await pool.execute('SELECT id, nome, email, tipo FROM usuarios WHERE id = ?', [id]);
        return rows[0] || null;
    }
};

module.exports = Usuario;