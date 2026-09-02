/**
 * Middlewares de autenticação e autorização baseados em sessão.
 */

/**
 * Garante que existe um usuário autenticado na sessão.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
    if (!req.session || !req.session.usuarioId) {
        return res.redirect('/login');
    }
    return next();
}

/**
 * Garante que o usuário autenticado possui o papel de organizador.
 */
function requireOrganizador(req, res, next) {
    if (!req.session || req.session.tipo !== 'organizador') {
        return res.status(403).render('erro', {
            titulo: 'Acesso negado',
            mensagem: 'Apenas organizadores podem acessar este recurso.'
        });
    }
    return next();
}

/**
 * Disponibiliza os dados do usuário logado para todas as views.
 */
function injetarUsuarioNasViews(req, res, next) {
    res.locals.usuario = req.session ? req.session.usuario : null;  // string (nome)
    res.locals.tipo = req.session ? req.session.tipo : null;        // string (tipo)
    res.locals.usuarioId = req.session ? req.session.usuarioId : null;
    next();
}

module.exports = { requireAuth, requireOrganizador, injetarUsuarioNasViews };