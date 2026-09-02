const pool = require('../config/database');

const Inscricao = {
    async criar(eventoId, participanteId) {
        const [resultado] = await pool.execute(
            'INSERT INTO inscricoes (evento_id, participante_id) VALUES (?, ?)',
            [eventoId, participanteId]
        );
        return resultado.insertId;
    },

    async jaInscrito(eventoId, participanteId) {
        const [linhas] = await pool.execute(
            'SELECT id FROM inscricoes WHERE evento_id = ? AND participante_id = ?',
            [eventoId, participanteId]
        );
        return linhas.length > 0;
    },

    async contarPorEvento(eventoId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) AS total FROM inscricoes WHERE evento_id = ?',
            [eventoId]
        );
        return rows[0].total;
    },

    async listarPorUsuario(participanteId) {
        const [linhas] = await pool.execute(`
            SELECT i.id, i.data_inscricao, 
                   e.id AS evento_id, e.titulo, e.data, e.local
            FROM inscricoes i
            INNER JOIN eventos e ON e.id = i.evento_id
            WHERE i.participante_id = ?
            ORDER BY e.data ASC
        `, [participanteId]);
        return linhas;
    },

    async buscarPorIdEUsuario(id, participanteId) {
        const [linhas] = await pool.execute(
            'SELECT id, evento_id, participante_id FROM inscricoes WHERE id = ? AND participante_id = ?',
            [id, participanteId]
        );
        return linhas.length > 0 ? linhas[0] : null;
    },

    async cancelar(id) {
        const [resultado] = await pool.execute('DELETE FROM inscricoes WHERE id = ?', [id]);
        return resultado.affectedRows > 0;
    }
};

module.exports = Inscricao;