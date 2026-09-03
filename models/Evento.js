const pool = require('../config/database');

const Evento = {
    /**
     * @returns {Promise<Array>}
     */
    async listarTodos() {
        const [linhas] = await pool.execute(`
            SELECT e.id, e.titulo, e.descricao, e.data, e.local, e.vagas,
                   e.organizador_id, u.nome AS organizador_nome
            FROM eventos e
            INNER JOIN usuarios u ON u.id = e.organizador_id
            ORDER BY e.data DESC
        `);
        return linhas;
    },

    async buscarPorId(id) {
        const [linhas] = await pool.execute(`
            SELECT e.id, e.titulo, e.descricao, e.data, e.local, e.vagas,
                   e.organizador_id, u.nome AS organizador_nome
            FROM eventos e
            INNER JOIN usuarios u ON u.id = e.organizador_id
            WHERE e.id = ?
        `, [id]);
        return linhas.length > 0 ? linhas[0] : null;
    },

    async criar(titulo, descricao, data, local, vagas, organizadorId) {
        const [resultado] = await pool.execute(
            'INSERT INTO eventos (titulo, descricao, data, local, vagas, organizador_id) VALUES (?, ?, ?, ?, ?, ?)',
            [titulo, descricao, data, local, vagas, organizadorId]
        );
        return resultado.insertId;
    },

    /**
     * Atualiza um evento existente.
     */
    async atualizar(id, titulo, descricao, data, local, vagas) {
        const [resultado] = await pool.execute(
            'UPDATE eventos SET titulo = ?, descricao = ?, data = ?, local = ?, vagas = ? WHERE id = ?',
            [titulo, descricao, data, local, vagas, id]
        );
        return resultado.affectedRows > 0;
    },

    /**
     * Exclui um evento.
     */
    async excluir(id) {
        const [resultado] = await pool.execute('DELETE FROM eventos WHERE id = ?', [id]);
        return resultado.affectedRows > 0;
    }
};

module.exports = Evento;