# Sistema de Ordens de Serviço - FabLab SENAI

Sistema web desenvolvido para gerenciar ordens de serviço do FabLab, permitindo o cadastro, acompanhamento, aprovação, recusa, finalização e consulta de solicitações. O projeto também possui controle de usuários com separação de permissões entre funcionários e administradores.

## 📌 Sobre o projeto

O sistema foi desenvolvido como Projeto Integrador do curso técnico em Desenvolvimento de Sistemas. A aplicação tem como objetivo substituir ou melhorar o controle manual de ordens de serviço, centralizando as informações em uma plataforma com autenticação, histórico, filtros, geração de PDF e controle de acesso.

No sistema, funcionários podem cadastrar e acompanhar ordens de serviço. Administradores acessam uma área separada para gerenciar usuários, podendo cadastrar, editar, desativar, reativar e redefinir senhas.

## 🚀 Funcionalidades

### Funcionário

- Login com autenticação por token JWT;
- Cadastro de ordens de serviço;
- Listagem de ordens de serviço;
- Filtro por nome do projeto, status e período;
- Paginação da lista de ordens;
- Visualização detalhada da OS;
- Edição de OS apenas enquanto estiver com status pendente;
- Alteração de status seguindo regras de negócio;
- Geração de PDF individual da OS;
- Exportação da lista de OS em PDF;
- Edição do próprio perfil e alteração de senha.

### Administrador

- Acesso a uma área exclusiva de gerenciamento;
- Cadastro de novos usuários;
- Listagem paginada de usuários;
- Edição de nome, e-mail e tipo de usuário;
- Alteração de senha de outros usuários;
- Desativação e reativação de usuários;
- Proteção para impedir que o administrador desative o próprio usuário;
- Edição do próprio perfil.

## 🔄 Regras de status da OS

O sistema possui uma regra de fluxo para evitar alterações indevidas no andamento da ordem de serviço:

- Uma OS nasce com status `pendente`;
- Uma OS `pendente` só pode ser alterada para `aprovada` ou `recusada`;
- Uma OS `aprovada` só pode ser alterada para `finalizada`;
- Uma OS `recusada` não pode mais ter o status alterado;
- Uma OS `finalizada` não pode mais ter o status alterado;
- A edição dos dados da OS só é permitida enquanto ela estiver `pendente`.

## 🛠️ Tecnologias utilizadas

### Frontend

- React;
- Vite;
- React Router DOM;
- Axios;
- React Hot Toast;
- React Icons;
- CSS.

### Backend

- Node.js;
- Express;
- MySQL;
- mysql2;
- bcryptjs;
- jsonwebtoken;
- pdfkit;
- cors;
- dotenv.

## 📁 Estrutura do projeto

```bash
projeto-integrador-senai/
├── backend/
│   ├── bd.txt
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       └── routes/
│
└── projeto/
    ├── package.json
    └── src/
        ├── assets/
        ├── components/
        ├── pages/
        └── services/
```

## ✅ Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js;
- npm;
- MySQL Server;
- MySQL Workbench, DBeaver ou outro gerenciador de banco de dados.

## ⚙️ Configuração do banco de dados

O script de criação do banco está no arquivo:

```bash
backend/bd.txt
```

Execute esse script no MySQL para criar o banco `fablab_os`, as tabelas `usuarios` e `ordens_servico`, além do usuário administrador inicial.

Também é possível executar pelo terminal:

```bash
mysql -u root -p < backend/bd.txt
```

Após executar o script, será criado um usuário administrador padrão:

```txt
E-mail: admin@admin.com
Senha: 1234
```

> Recomenda-se alterar essa senha após o primeiro acesso.

## 🔐 Configuração das variáveis de ambiente

### Backend

Na pasta `backend`, crie um arquivo `.env` com base no arquivo `.env.example`:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_NAME=fablab_os
DB_PORT=3306
JWT_SECRET=sua_chave_secreta
```

Caso seu MySQL esteja rodando em outra porta, altere o valor de `DB_PORT`.

### Frontend

Na pasta `projeto`, crie um arquivo `.env` com base no arquivo `.env.example`:

```env
VITE_API_URL=http://localhost:3001
```

## ▶️ Como executar o projeto

### 1. Executar o backend

Acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
node src/server.js
```

Se preferir usar o nodemon durante o desenvolvimento:

```bash
npx nodemon src/server.js
```

O backend será executado, por padrão, em:

```txt
http://localhost:3001
```

### 2. Executar o frontend

Em outro terminal, acesse a pasta do frontend:

```bash
cd projeto
```

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço para acessar a aplicação, geralmente:

```txt
http://localhost:5173
```

## 🔗 Principais rotas da aplicação

### Rotas do frontend

| Rota | Descrição |
| --- | --- |
| `/login` | Tela de login |
| `/` | Redireciona o usuário conforme o tipo de conta |
| `/ordens` | Lista de ordens de serviço para funcionários |
| `/ordens/nova` | Cadastro de nova ordem de serviço |
| `/ordens/:id` | Detalhes da ordem de serviço |
| `/ordens/:id/editar` | Edição de ordem de serviço pendente |
| `/usuarios` | Gerenciamento de usuários para administradores |
| `/usuarios/novo` | Cadastro de novo usuário |
| `/usuarios/:id/editar` | Edição de usuário |
| `/perfil` | Perfil do usuário logado |

### Rotas principais da API

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/auth/login` | Realiza login |
| `POST` | `/auth/register` | Cadastra usuário, apenas admin |
| `GET` | `/ordens` | Lista ordens de serviço |
| `POST` | `/ordens` | Cadastra ordem de serviço |
| `GET` | `/ordens/:id` | Busca uma OS por ID |
| `PUT` | `/ordens/:id` | Atualiza uma OS pendente |
| `PUT` | `/ordens/:id/status` | Atualiza o status da OS |
| `GET` | `/ordens/:id/pdf` | Gera PDF individual da OS |
| `GET` | `/ordens/pdf-lista` | Exporta a lista de OS em PDF |
| `GET` | `/usuarios` | Lista usuários, apenas admin |
| `GET` | `/usuarios/:id` | Busca usuário por ID, apenas admin |
| `PUT` | `/usuarios/:id` | Atualiza usuário, apenas admin |
| `PUT` | `/usuarios/:id/senha` | Altera senha de usuário, apenas admin |
| `PUT` | `/usuarios/:id/desativar` | Desativa usuário, apenas admin |
| `PUT` | `/usuarios/:id/reativar` | Reativa usuário, apenas admin |
| `GET` | `/usuarios/:id/perfil` | Busca perfil do usuário logado |
| `PUT` | `/usuarios/:id/perfil` | Atualiza perfil do usuário logado |
| `PUT` | `/usuarios/:id/perfil/senha` | Altera a própria senha |

## 🔒 Controle de acesso

O sistema utiliza autenticação com JWT. Após o login, o token é armazenado no `sessionStorage` do navegador e enviado automaticamente nas requisições para a API.

Existem dois tipos de usuário:

- `funcionario`: pode acessar e gerenciar ordens de serviço;
- `admin`: pode acessar a área de gerenciamento de usuários.

As rotas protegidas validam o token e verificam o tipo de usuário antes de permitir o acesso.

## 📄 Geração de PDF

O backend utiliza a biblioteca `pdfkit` para gerar arquivos PDF. O sistema permite:

- Gerar um PDF com os detalhes de uma ordem de serviço específica;
- Exportar em PDF a listagem de ordens de serviço com os filtros aplicados.

## 🧪 Observações para desenvolvimento

- O arquivo `.env` não deve ser enviado para o GitHub;
- Use o `.env.example` apenas como modelo das variáveis necessárias;
- A pasta `node_modules` não deve ser versionada;
- O banco de dados precisa estar rodando antes de iniciar o backend;
- O frontend depende da variável `VITE_API_URL` apontando para o backend.

## 📌 Possíveis melhorias futuras

- Envio de notificação por e-mail ao coordenador;
- Recuperação de senha por e-mail;
- Dashboard com gráficos e indicadores;
- Histórico detalhado de alterações nas ordens de serviço;
- Diferentes níveis de permissão para usuários;
- Deploy completo com frontend, backend e banco de dados online.

## 👨‍💻 Autor

Projeto desenvolvido como parte do curso técnico em Desenvolvimento de Sistemas do SENAI.
