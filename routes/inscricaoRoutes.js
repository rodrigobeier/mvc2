const router = require('express').Router();
const inscricaoController = require('../controllers/inscricaoController');
const { requireAuth } = require('../middlewares/auth');

// Protege todas as rotas
router.use(requireAuth);

router.get('/minhas', inscricaoController.minhasInscricoes);
router.post('/evento/:id/inscrever', inscricaoController.inscrever);
router.post('/cancelar/:id', inscricaoController.cancelar);

module.exports = router;