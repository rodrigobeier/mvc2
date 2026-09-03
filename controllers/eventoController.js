const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');

const eventoController = {
    /**
     * Lista todos os eventos cadastrados.
     */
    async listar(req, res) {
        try {
            const eventos = await Evento.listarTodos();
            res.render('eventos/listar', { eventos });
        } catch (erro) {
            console.error('Erro ao listar eventos:', erro.message);
            res.status(500).render('erro', {
                titulo: 'Erro',
                mensagem: 'Não foi possível carregar os eventos no momento.'
            });
        }
    },

    /**
     * Exibe os detalhes de um evento específico.
     * Calcula o total de inscritos e verifica se o usuário já está inscrito.
     */
    async detalhes(req, res) {
        try {
            const id = Number(req.params.id);
            if (!Number.isInteger(id)) {
                return res.status(400).render('erro', { 
                    titulo: 'Requisição inválida', 
                    mensagem: 'ID de evento inválido.' 
                });
            }

            const evento = await Evento.buscarPorId(id);
            if (!evento) {
                return res.status(404).render('erro', { 
                    titulo: 'Não encontrado', 
                    mensagem: 'Evento não encontrado.' 
                });
            }

            // Calcula o total de inscritos
            const totalInscritos = await Inscricao.contarPorEvento(id);
            evento.total_inscritos = totalInscritos;

            // Verifica se o usuário logado já está inscrito
            let jaInscrito = false;
            if (req.session.usuarioId) {
                jaInscrito = await Inscricao.jaInscrito(id, req.session.usuarioId);
            }

            res.render('eventos/detalhes', { 
                evento, 
                jaInscrito,
                usuario: req.session.usuario,
                tipo: req.session.tipo,
                usuarioId: req.session.usuarioId
            });
        } catch (erro) {
            console.error('Erro ao exibir evento:', erro.message);
            res.status(500).render('erro', { 
                titulo: 'Erro', 
                mensagem: 'Não foi possível carregar o evento.' 
            });
        }
    },

    /**
     * Lista os eventos criados pelo organizador logado.
     * Apenas organizadores podem acessar.
     */
    async meusEventos(req, res) {
        try {
            if (req.session.tipo !== 'organizador') {
                return res.status(403).render('erro', { 
                    titulo: 'Acesso negado', 
                    mensagem: 'Apenas organizadores podem ver seus eventos.' 
                });
            }

            const eventos = await Evento.findByOrganizador(req.session.usuarioId);
            res.render('eventos/meus-eventos', { eventos });
        } catch (erro) {
            console.error('Erro ao listar meus eventos:', erro.message);
            res.status(500).render('erro', { 
                titulo: 'Erro', 
                mensagem: 'Não foi possível carregar seus eventos.' 
            });
        }
    },

    /**
     * Renderiza o formulário de criação de evento.
     */
    exibirFormularioCriacao(req, res) {
        res.render('eventos/criar', { erro: null });
    },

    /**
     * Cria um novo evento associado ao organizador logado.
     */
    async criar(req, res) {
        try {
            const titulo = String(req.body.titulo || '').trim();
            const descricao = String(req.body.descricao || '').trim();
            const dataEvento = String(req.body.data || '').trim();
            const local = String(req.body.local || '').trim();
            const vagas = Number(req.body.vagas) || 0;

            if (!titulo || !dataEvento || !local) {
                return res.status(400).render('eventos/criar', { 
                    erro: 'Preencha todos os campos obrigatórios (título, data, local).' 
                });
            }

            const dataFormatada = new Date(dataEvento).toISOString().slice(0, 19).replace('T', ' ');
            const organizadorId = req.session.usuarioId;

            if (!organizadorId) {
                return res.status(401).render('eventos/criar', { 
                    erro: 'Faça login como organizador.' 
                });
            }

            const id = await Evento.criar(titulo, descricao, dataFormatada, local, vagas, organizadorId);
            res.redirect(`/eventos/${id}`);
        } catch (erro) {
            console.error('Erro ao criar evento:', erro.message);
            return res.status(500).render('eventos/criar', {
                erro: 'Erro interno ao criar o evento. Tente novamente.'
            });
        }
    },

    /**
     * Renderiza o formulário de edição de um evento existente.
     * Apenas o organizador dono do evento pode editar.
     */
    async exibirFormularioEdicao(req, res) {
        try {
            const id = Number(req.params.id);
            const evento = await Evento.buscarPorId(id);

            if (!evento) {
                return res.status(404).render('erro', { 
                    titulo: 'Não encontrado', 
                    mensagem: 'Evento não encontrado.' 
                });
            }

            if (evento.organizador_id !== req.session.usuarioId) {
                return res.status(403).render('erro', { 
                    titulo: 'Acesso negado', 
                    mensagem: 'Você não é o organizador deste evento.' 
                });
            }

            res.render('eventos/editar', { evento, erro: null });
        } catch (erro) {
            console.error('Erro ao carregar edição:', erro.message);
            res.status(500).render('erro', { 
                titulo: 'Erro', 
                mensagem: 'Não foi possível carregar o formulário.' 
            });
        }
    },

    /**
     * Atualiza um evento existente.
     * Apenas o organizador dono do evento pode atualizar.
     */
    async atualizar(req, res) {
        try {
            const id = Number(req.params.id);
            const eventoAtual = await Evento.buscarPorId(id);

            if (!eventoAtual) {
                return res.status(404).render('erro', { 
                    titulo: 'Não encontrado', 
                    mensagem: 'Evento não encontrado.' 
                });
            }

            if (eventoAtual.organizador_id !== req.session.usuarioId) {
                return res.status(403).render('erro', { 
                    titulo: 'Acesso negado', 
                    mensagem: 'Você não é o organizador deste evento.' 
                });
            }

            const titulo = String(req.body.titulo || '').trim();
            const descricao = String(req.body.descricao || '').trim();
            const dataEvento = String(req.body.data || '').trim();
            const local = String(req.body.local || '').trim();
            const vagas = Number(req.body.vagas) || 0;

            if (!titulo || !dataEvento || !local) {
                return res.status(400).render('eventos/editar', { 
                    evento: { ...eventoAtual, ...req.body }, 
                    erro: 'Preencha todos os campos obrigatórios.' 
                });
            }

            const dataFormatada = new Date(dataEvento).toISOString().slice(0, 19).replace('T', ' ');
            await Evento.atualizar(id, titulo, descricao, dataFormatada, local, vagas);
            return res.redirect(`/eventos/${id}`);
        } catch (erro) {
            console.error('Erro ao atualizar evento:', erro.message);
            return res.status(500).render('erro', { 
                titulo: 'Erro', 
                mensagem: 'Não foi possível atualizar o evento.' 
            });
        }
    },

    /**
     * Exclui um evento.
     * Apenas o organizador dono do evento pode excluir.
     */
    async excluir(req, res) {
        try {
            const id = Number(req.params.id);
            const evento = await Evento.buscarPorId(id);

            if (!evento) {
                return res.status(404).render('erro', { 
                    titulo: 'Não encontrado', 
                    mensagem: 'Evento não encontrado.' 
                });
            }

            if (evento.organizador_id !== req.session.usuarioId) {
                return res.status(403).render('erro', { 
                    titulo: 'Acesso negado', 
                    mensagem: 'Você não é o organizador deste evento.' 
                });
            }

            await Evento.excluir(id);
            return res.redirect('/eventos');
        } catch (erro) {
            console.error('Erro ao excluir evento:', erro.message);
            return res.status(500).render('erro', { 
                titulo: 'Erro', 
                mensagem: 'Não foi possível excluir o evento.' 
            });
        }
    }
};

module.exports = eventoController;