/**
 * Script de inicialização do schema do banco de dados.
 * Cria as tabelas mínimas exigidas (usuarios, eventos, inscricoes)
 * caso ainda não existam, usando comandos DDL parametrizados de forma
 * segura (não há entrada de usuário aqui, mas a estrutura evita
 * concatenação manual de valores).
 *
 * Execução: npm run init-db
 *
 * @async
 * @returns {Promise<void>}
 */

const { pool, testarConexao } = require('./config/database');

async function inicializarBanco() {
    try {
        await testarConexao();

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(150) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                senha_hash VARCHAR(255) NOT NULL,
                tipo ENUM('organizador', 'participante') NOT NULL DEFAULT 'participante',
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS eventos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(200) NOT NULL,
                descricao TEXT,
                data_evento DATETIME NOT NULL,
                local VARCHAR(200),
                vagas INT NOT NULL DEFAULT 0,
                organizador_id INT NOT NULL,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_eventos_organizador
                    FOREIGN KEY (organizador_id) REFERENCES usuarios(id)
                    ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS inscricoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                evento_id INT NOT NULL,
                usuario_id INT NOT NULL,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_inscricoes_evento
                    FOREIGN KEY (evento_id) REFERENCES eventos(id)
                    ON DELETE CASCADE,
                CONSTRAINT fk_inscricoes_usuario
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                    ON DELETE CASCADE,
                CONSTRAINT uq_inscricao_unica UNIQUE (evento_id, usuario_id)
            ) ENGINE=InnoDB;
        `);

        console.log('✅ Schema do banco de dados verificado/criado com sucesso.');
        process.exit(0);
    } catch (erro) {
        console.error('❌ Erro ao inicializar o schema do banco de dados:', erro.message);
        process.exit(1);
    }
}

inicializarBanco();
