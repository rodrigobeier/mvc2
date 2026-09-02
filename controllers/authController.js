const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

const authController = {
    // Exibe a tela de login
    exibirLogin(req, res) {
        console.log('[auth] GET /login - renderizando login');
        res.render('login', { erro: null });
    },

    // Processa o login
    async login(req, res) {
        console.log('[auth] POST /login - tentativa de login');
        try {
            const { email, senha } = req.body;

            // Verifica se os campos foram enviados
            if (!email || !senha) {
                console.log('[auth] Campos vazios');
                return res.render('login', { erro: 'Preencha e-mail e senha.' });
            }

            // Busca usuário pelo email
            const usuario = await Usuario.buscarPorEmail(email);
            if (!usuario) {
                console.log('[auth] Usuário não encontrado:', email);
                return res.render('login', { erro: 'E-mail ou senha inválidos.' });
            }

            // Verifica a senha
            const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
            if (!senhaValida) {
                console.log('[auth] Senha inválida para:', email);
                return res.render('login', { erro: 'E-mail ou senha inválidos.' });
            }

            // SALVA NA SESSÃO
            req.session.usuarioId = usuario.id;
            req.session.usuario = usuario.nome;
            req.session.tipo = usuario.tipo;

            console.log('[auth] Login bem-sucedido:', usuario.email, 'ID:', usuario.id);
            // Redireciona para a listagem de eventos
            return res.redirect('/eventos');
        } catch (erro) {
            console.error('[auth] Erro no login:', erro.message, erro.stack);
            return res.render('login', { erro: 'Erro interno no servidor. Tente novamente.' });
        }
    },

    // Exibe a tela de cadastro
    exibirCadastro(req, res) {
        console.log('[auth] GET /cadastro - renderizando cadastro');
        res.render('cadastro', { erro: null });
    },

    // Processa o cadastro
    async cadastrar(req, res) {
        console.log('[auth] POST /cadastro - tentativa de cadastro');
        try {
            const { nome, email, senha, tipo } = req.body;

            // Valida campos obrigatórios
            if (!nome || !email || !senha) {
                console.log('[auth] Campos obrigatórios faltando');
                return res.render('cadastro', { erro: 'Preencha todos os campos obrigatórios.' });
            }

            // Verifica se o email já existe
            const existe = await Usuario.buscarPorEmail(email);
            if (existe) {
                console.log('[auth] E-mail já cadastrado:', email);
                return res.render('cadastro', { erro: 'Este e-mail já está cadastrado.' });
            }

            // Hash da senha
            const salt = bcrypt.genSaltSync(10);
            const senhaHash = bcrypt.hashSync(senha, salt);

            // Cria o usuário
            const novoId = await Usuario.criar(nome, email, senhaHash, tipo || 'participante');
            console.log('[auth] Usuário criado com ID:', novoId);

            return res.redirect('/login');
        } catch (erro) {
            console.error('[auth] Erro no cadastro:', erro.message, erro.stack);
            return res.render('cadastro', { erro: 'Erro interno ao cadastrar. Tente novamente.' });
        }
    },

    // Logout
    logout(req, res) {
        console.log('[auth] POST /logout - destruindo sessão');
        req.session.destroy((err) => {
            if (err) {
                console.error('[auth] Erro ao destruir sessão:', err);
                return res.redirect('/eventos');
            }
            return res.redirect('/login');
        });
    }
};

module.exports = authController;