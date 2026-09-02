/**
 * Controller responsável pela inscrição de participantes em eventos.
 */

const Inscricao = require('../models/Inscricao');
const Evento = require('../models/Evento');

const inscricaoController = {
    /**
     * Inscreve o usuário logado no evento informado.
     */
    async inscrever(req, res) {
        try {
            const eventoId = Number(req.params.id);
            const usuarioId = req.session.usuarioId; // CORRIGIDO

            if (!usuarioId) {
                return res.redirect('/login');
            }

            // Verifica se o evento existe
            const evento = await Evento.buscarPorId(eventoId);
            if (!evento) {
                return res.status(404).render('erro', { titulo: 'Não encontrado', mensagem: 'Evento não encontrado.' });
            }

            // Verifica se já está inscrito
            const jaInscrito = await Inscricao.jaInscrito(eventoId, usuarioId);
            if (jaInscrito) {
                return res.redirect(`/eventos/${eventoId}?erro=ja_inscrito`);
            }

            // Verifica vagas (se houver)
            if (evento.vagas && evento.vagas > 0) {
                const totalInscritos = await Inscricao.contarPorEvento(eventoId);
                if (totalInscritos >= evento.vagas) {
                    return res.status(400).render('erro', { 
                        titulo: 'Vagas esgotadas', 
                        mensagem: 'Não há mais vagas disponíveis para este evento.' 
                    });
                }
            }

            // Realiza a inscrição
            await Inscricao.criar(eventoId, usuarioId);
            return res.redirect('/inscricoes/minhas');
        } catch (erro) {
            console.error('Erro ao realizar inscrição:', erro.message);
            return res.status(500).render('erro', { titulo: 'Erro', mensagem: 'Não foi possível concluir a inscrição.' });
        }
    },

    /**
     * Lista as inscrições do usuário logado.
     */
    async minhasInscricoes(req, res) {
        try {
            const usuarioId = req.session.usuarioId;
            if (!usuarioId) {
                return res.redirect('/login');
            }
            const inscricoes = await Inscricao.listarPorUsuario(usuarioId);
            res.render('inscricoes/minhas-inscricoes', { inscricoes });
        } catch (erro) {
            console.error('Erro ao listar inscrições:', erro.message);
            res.status(500).render('erro', { titulo: 'Erro', mensagem: 'Não foi possível carregar suas inscrições.' });
        }
    },

    /**
     * Cancela uma inscrição do usuário logado.
     */
    async cancelar(req, res) {
        try {
            const id = Number(req.params.id);
            const usuarioId = req.session.usuarioId;

            const inscricao = await Inscricao.buscarPorIdEUsuario(id, usuarioId);
            if (!inscricao) {
                return res.status(404).render('erro', { titulo: 'Não encontrado', mensagem: 'Inscrição não encontrada.' });
            }

            await Inscricao.cancelar(id);
            return res.redirect(`/eventos/${eventoId}`);
        } catch (erro) {
            console.error('Erro ao cancelar inscrição:', erro.message);
            return res.status(500).render('erro', { titulo: 'Erro', mensagem: 'Não foi possível cancelar a inscrição.' });
        }
    }
};

module.exports = inscricaoController;