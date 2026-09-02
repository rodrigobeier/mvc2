# EventHub – Sistema de Gestão de Eventos e Inscrições

**EventHub** é uma aplicação web monolítica com arquitetura MVC desenvolvida em Node.js, Express, EJS e MySQL. Permite que organizadores criem, editem e excluam eventos, e que participantes se inscrevam em eventos disponíveis, com controle de vagas e inscrições em tempo real.

## Tecnologias

**Backend**: Node.js + Express
**Frontend**: EJS (renderização no servidor), CSS customizado
**Banco de Dados**: MySQL (Aiven – gerenciado na nuvem)
**Autenticação**: Sessão com cookie `httpOnly`
**Segurança**: Senhas hasheadas com bcrypt, proteção contra SQL Injection (Prepared Statements)
**Deploy**: Render (Web Service)


## Funcionalidades

Cadastro e login de usuários (organizador/participante)
Criação, edição e exclusão de eventos (restrito ao organizador)
Listagem de eventos com contagem de inscritos
Inscrição de participantes em eventos (com validação de vagas)
Cancelamento de inscrição
Página de detalhes do evento com botões dinâmicos
Design responsivo com tema azul profissional