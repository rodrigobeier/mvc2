const router = require('express').Router();
const authController = require('../controllers/authController');

router.get('/login', authController.exibirLogin);
router.post('/login', authController.login);
router.get('/cadastro', authController.exibirCadastro);
router.post('/cadastro', authController.cadastrar);
router.post('/logout', authController.logout);

module.exports = router;