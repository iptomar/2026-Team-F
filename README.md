# README #

Este repositório contém o código-fonte do projeto `2026-Team-F`, desenvolvido no âmbito da unidade curricular de **Gestão de Projetos**.

A aplicação consiste numa **ferramenta de formulários parametrizados**, permitindo criar, editar, guardar, publicar, preencher e consultar formulários dinâmicos. O objetivo principal é disponibilizar uma solução flexível, capaz de adaptar estruturas de formulários a diferentes necessidades, como educação, saúde, lares, polícia, bombeiros, empresas, associações ou serviços administrativos.

O projeto está dividido em duas componentes principais:

|        Diretoria        |                         Descrição                          |
|-------------------------|------------------------------------------------------------|
|        Backend          | API REST desenvolvida com **Node.js**, **Express**, **TypeScript**, **TypeORM** e **SQLite**. |
|        Frontend         | Interface web desenvolvida com **React**, **Vite** e **Tailwind CSS**. |

## Como configurar o projeto? ##

### 1. Clonar o repositório ###

Clonar o repositório para a máquina local:

```bash
git clone https://github.com/iptomar/2026-Team-F.git
```

Entrar na diretoria do projeto:

```bash
cd 2026-Team-F
```

Selecionar a branch de trabalho atual:

```bash
git checkout Sprint-3
```

Atualizar a branch local:

```bash
git pull origin Sprint-3
```

**NOTAS:** Antes de começar qualquer alteração, confirma sempre que estás na branch correta.

### 2. Configurar o Backend ###

Abrir um terminal na raiz do projeto e entrar na diretoria do backend:

```bash
cd Backend
```

Instalar as dependências:

```bash
npm install
```

Executar as migrations da base de dados:

```bash
npm run migration:run
```

Iniciar o backend em modo de desenvolvimento:

```bash
npm run dev
```

Se tudo estiver correto, o terminal deverá apresentar uma mensagem semelhante a:

```text
Base de dados conectada com sucesso.
Servidor a correr na porta 3000
```

O backend ficará disponível em:

```text
http://localhost:3000
```

### 3. Configurar o Frontend ###

Abrir um novo terminal na raiz do projeto e entrar na diretoria do frontend:

```bash
cd Frontend
```

Instalar as dependências:

```bash
npm install
```

Iniciar o frontend em modo de desenvolvimento:

```bash
npm run dev
```

O Vite irá indicar no terminal o endereço local da aplicação, normalmente:

```text
http://localhost:5173
```

### 4. Aceder à aplicação ###

Depois de iniciar o backend e o frontend, abrir o endereço do frontend no navegador.

O fluxo normal de utilização é:

1. Criar conta ou iniciar sessão;
2. Criar um novo formulário;
3. Adicionar e configurar campos;
4. Guardar como rascunho ou publicar;
5. Pré-visualizar e preencher o formulário;
6. Submeter o formulário;
7. Consultar a submissão em **Ver Submissões**.

**NOTAS:** Publicar um formulário cria ou atualiza um modelo de formulário. Uma submissão só é criada quando o formulário é preenchido e submetido.

## Comandos disponíveis ##

### Backend ###

|          Comando           |                         Descrição                         |
|----------------------------|-----------------------------------------------------------|
|       `npm run dev`        | Inicia o backend em modo de desenvolvimento.              |
|      `npm run build`       | Compila o código TypeScript.                              |
|      `npm run start`       | Executa o backend compilado a partir da diretoria `dist`. |
|  `npm run migration:run`   | Executa as migrations pendentes da base de dados.         |
| `npm run migration:revert` | Reverte a última migration executada.                     |

### Frontend ###

|        Comando        |                         Descrição                         |
|-----------------------|-----------------------------------------------------------|
|     `npm run dev`     | Inicia o servidor de desenvolvimento do Vite.             |
|    `npm run build`    | Gera a build de produção do frontend.                     |
|   `npm run preview`   | Permite pré-visualizar localmente a build de produção.    |

## Base de dados ##

O backend utiliza **SQLite** em ambiente de desenvolvimento.

Por defeito, a base de dados é criada dentro da diretoria `Backend` com o nome:

```text
database.sqlite
```

Caso seja necessário reiniciar a base de dados local, pode-se remover o ficheiro e voltar a executar as migrations:

```bash
cd Backend
rm -f database.sqlite
npm run migration:run
```

**NOTAS:** Este processo remove os dados locais de teste. Não deve ser usado se existirem dados importantes que ainda precisem de ser consultados.

## Fluxo de Git ##

O desenvolvimento do projeto está organizado por branches de Sprint.

|        Branch        |                         Utilização                         |
|----------------------|-----------------------------------------------------------|
|        `main`        | Branch principal com progresso integrado.                 |
|      `Sprint-1`      | Branch utilizada para o desenvolvimento da Sprint 1.      |
|      `Sprint-2`      | Branch utilizada para o desenvolvimento da Sprint 2.      |
|      `Sprint-3`      | Branch utilizada para o desenvolvimento da Sprint 3.      |

Antes de começar a trabalhar:

```bash
git checkout Sprint-3
git pull origin Sprint-3
```

Depois de terminar e testar uma alteração:

```bash
git status
git add <ficheiros-alterados>
git commit -m "FEAT: Mensagem significativa em português."
git push origin Sprint-3
```

**NOTAS:** Não devem ser commitados ficheiros locais como `node_modules`, bases de dados SQLite locais ou logs temporários.

## Regras de commits ##

As mensagens de commit devem ser claras, escritas em português e alinhadas com o tipo de alteração realizada.

|    Prefixo    |                         Utilização                         |
|---------------|-----------------------------------------------------------|
|    `ADDED`    | Utilizado quando são adicionados novos ficheiros ou estruturas. |
|    `FEAT`     | Utilizado quando é implementada uma nova funcionalidade.  |
|   `CHANGED`   | Utilizado quando é alterado comportamento já existente.   |
|    `FIXED`    | Utilizado quando é corrigido um erro.                     |
|   `REMOVED`   | Utilizado quando é removido código, ficheiros ou comportamento obsoleto. |
|    `MERGE`    | Utilizado para integração de branches ou progresso de sprint. |

Exemplo:

```bash
git commit -m "FEAT: Adicionados tipos avançados de campos no backend." -m "Atualizado o modelo de FormTemplate para suportar campos de texto, texto longo, número, email, data, secção, título e instrução." -m "A validação dos fields passa a aceitar estruturas avançadas e secções com subcampos, mantendo compatibilidade com label, radio, checkbox e dropdown."
```