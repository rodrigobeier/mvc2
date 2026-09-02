const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { requireAuth, requireOrganizador } = require('../middlewares/auth');

router.get('/', eventoController.listar);
router.get('/meus', requireAuth, requireOrganizador, eventoController.meusEventos);
router.get('/novo', requireAuth, requireOrganizador, eventoController.exibirFormularioCriacao);
router.post('/', requireAuth, requireOrganizador, eventoController.criar);
router.get('/:id', eventoController.detalhes);
router.get('/:id/editar', requireAuth, requireOrganizador, eventoController.exibirFormularioEdicao);
router.put('/:id', requireAuth, requireOrganizador, eventoController.atualizar);
router.delete('/:id', requireAuth, requireOrganizador, eventoController.excluir);

module.exports = router;