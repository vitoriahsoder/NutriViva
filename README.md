# NutriViva 
### Organize suas refeições, viva seu equilíbrio.

## 1. Sobre o projeto

O NutriViva é uma plataforma web que tem como objetivo ajudar as pessoas a organizar suas refeições e planejar sua alimentação semanal de maneira prática.

## 2. Problema identificado

A rotina corrida e a falta de planejamento podem dificultar a organização das refeições. Muitas pessoas têm dificuldade para decidir o que comer durante a semana e manter uma rotina alimentar organizada.

## 3. Público-alvo

Pessoas que desejam organizar suas refeições, planejar a alimentação semanal e conhecer novas sugestões de pratos.

## 4. Proposta de solução

Desenvolver uma plataforma que permita planejar refeições, consultar sugestões alimentares e registrar as refeições realizadas, facilitando a organização da rotina alimentar.

## 5. Objetivos

**Objetivo geral:** Facilitar a organização das refeições por meio de uma plataforma digital.

**Objetivos específicos:**
- Planejar refeições semanalmente.
- Cadastrar e organizar refeições.
- Consultar sugestões alimentares.
- Registrar refeições realizadas.
- Salvar refeições favoritas.

## 6. Funcionalidades previstas

- Planejamento semanal de refeições.
- Cadastro, edição, consulta e exclusão de refeições.
- Sugestões de refeições.
- Registro alimentar.
- Lista de favoritos.
- Área administrativa para gerenciar sugestões.

## 7. Tipos de usuários

- **Usuário comum:** poderá organizar suas refeições, consultar sugestões e visualizar seus registros.
- **Administrador:** poderá cadastrar, editar e excluir sugestões disponibilizadas na plataforma.

## 8. Fluxo básico do sistema

O usuário acessará a plataforma, entrará em sua área pessoal, visualizará o painel inicial e poderá planejar suas refeições, consultar sugestões e registrar os alimentos consumidos.

O administrador acessará sua área específica para gerenciar as sugestões disponíveis.

## 9. Tecnologias previstas

- HTML, CSS e JavaScript para o front-end.
- Node.js e Express para o back-end.
- MySQL para o banco de dados.
- Git e GitHub para o controle de versões e armazenamento do projeto.

## 10. Estrutura do projeto

O projeto está organizado em pastas para separar o front-end, o back-end, o banco de dados e a documentação.

- **frontend:** arquivos HTML, CSS e JavaScript.
- **backend:** arquivos responsáveis pelo funcionamento da API.
- **controllers:** funções responsáveis pelas operações do sistema.
- **routes:** definição das rotas da API.
- **middlewares:** validação de autenticação e autorização.
- **database:** conexão com o banco de dados.
- **sql:** scripts de criação e organização do banco de dados.

## 11. Banco de dados

O NutriViva utiliza o MySQL para armazenar as informações. O banco de dados possui seis tabelas relacionadas:

- usuarios
- refeicoes
- planejamentos
- favoritos
- refeicoes_consumidas
- sugestoes

As tabelas utilizam chaves primárias (PK) e chaves estrangeiras (FK) para estabelecer os relacionamentos entre os dados.

## 12. Cadastro e autenticação

O sistema possui cadastro de usuários e login integrados ao banco de dados.

As senhas são protegidas utilizando a biblioteca bcryptjs, que realiza a criptografia por hash.

A autenticação utiliza JWT (JSON Web Token), permitindo verificar a identidade dos usuários durante o acesso às rotas protegidas.

## 13. Controle de acesso

O sistema possui dois níveis de acesso:

- **Usuário comum:** pode acessar as rotas que exigem autenticação.
- **Administrador:** possui acesso às rotas exclusivas de administração.

Foram desenvolvidos middlewares para verificar o token de autenticação e controlar as permissões de acesso.

## 14. Testes realizados

Os testes da API foram realizados utilizando o Thunder Client.

Foram testados:

- Cadastro de usuários.
- Login de usuários.
- Retorno do token JWT.
- Acesso à rota de perfil com autenticação.
- Bloqueio de acesso à rota administrativa para usuários comuns.
- Acesso à rota administrativa com usuário administrador.

## 15. Tecnologias utilizadas

- HTML, CSS e JavaScript.
- Node.js e Express.
- MySQL e MySQL2.
- bcryptjs.
- JSON Web Token (JWT).
- dotenv e cors.
- Thunder Client.
- Git e GitHub.