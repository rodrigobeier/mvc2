/**
 * Configuração central da aplicação Express (Aplicação 1 - EventHub, MVC).
 * Responsável por: middlewares globais, sessão (cookie httpOnly),
 * view engine (EJS), arquivos estáticos, montagem das rotas
 * e tratamento de erros.
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const inscricaoRoutes = require('./routes/inscricaoRoutes');
const { injetarUsuarioNasViews } = require('./middlewares/auth');

const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

const app = express();

app.use(methodOverride('_method'));
app.use(expressLayouts);
app.set('layout', 'layout');   // nome do arquivo de layout (sem .ejs)

// ===== VIEW ENGINE =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== MIDDLEWARES DE PARSING =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ===== ARQUIVOS ESTÁTICOS (CSS, imagens, JS do front) =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== SESSÃO COM COOKIE HTTPONLY =====
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 2 // 2 horas
    }
}));

// ===== INJETA DADOS DO USUÁRIO NAS VIEWS =====
app.use(injetarUsuarioNasViews);

// ===== ROTAS =====
app.get('/', (req, res) => res.redirect('/eventos'));
app.use('/auth', authRoutes);          // <- AGORA as rotas /login, /cadastro, /logout funcionam
app.use('/eventos', eventoRoutes);
app.use('/inscricoes', inscricaoRoutes);

// ===== 404 =====
app.use((req, res) => {
    res.status(404).render('erro', {
        titulo: 'Página não encontrada',
        mensagem: 'A página que você procura não existe.'
    });
});

// ===== TRATAMENTO GLOBAL DE ERROS =====
app.use((erro, req, res, next) => {
    console.error('Erro não tratado:', erro.stack || erro.message);
    const mensagem = process.env.NODE_ENV === 'production'
        ? 'Ocorreu um erro interno. Tente novamente mais tarde.'
        : erro.message;
    res.status(500).render('erro', { titulo: 'Erro interno', mensagem });
});


module.exports = app;