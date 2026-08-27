# ✅ Task Manager

Um gerenciador de tarefas web simples, moderno e responsivo — construído com **Python + Flask** no backend e **HTML, CSS e JavaScript puro** no frontend, usando um **arquivo JSON** como armazenamento. Projeto pensado para estudo e portfólio, sem banco de dados, sem Docker e sem bibliotecas externas desnecessárias.

![status](https://img.shields.io/badge/status-pronto%20para%20uso-7c6bff)
![python](https://img.shields.io/badge/python-3.x-2fd4a5)
![flask](https://img.shields.io/badge/flask-3.x-7c6bff)

---

## 📋 Descrição

O **Task Manager** permite criar, editar, concluir e excluir tarefas através de uma interface escura, minimalista e inspirada em ferramentas como Todoist, Notion e Trello. Todas as ações acontecem sem recarregar a página (via `fetch`), com feedback visual em tempo real: toasts de sucesso/erro, modais de confirmação e um dashboard com estatísticas.

### Funcionalidades

- ➕ Adicionar tarefa (título + descrição opcional)
- ✏️ Editar tarefa (modal dedicado)
- 🗑️ Excluir tarefa (com confirmação)
- ☑️ Marcar/desmarcar conclusão
- 📊 Dashboard com total, concluídas, pendentes e taxa de conclusão
- 🔍 Filtros: todas / pendentes / concluídas
- 🔔 Toasts de feedback e animações suaves
- 📱 Totalmente responsivo (mobile e desktop)

---

## 🛠️ Tecnologias

| Camada        | Tecnologia                          |
|---------------|--------------------------------------|
| Backend       | Python 3, Flask                      |
| Frontend      | HTML5, CSS3, JavaScript (vanilla)    |
| Armazenamento | Arquivo JSON (`data/tarefas.json`)   |
| Deploy        | Vercel (sem Docker, sem banco de dados) |

---

## 📁 Estrutura do projeto

```text
task-manager/
│
├── api/
│   └── index.py          # Aplicação Flask + API REST
│
├── templates/
│   └── index.html        # Página principal (HTML)
│
├── static/
│   ├── css/
│   │   └── style.css     # Estilos (tema escuro, responsivo)
│   └── js/
│       └── script.js     # Lógica do frontend (fetch, DOM, toasts)
│
├── data/
│   └── tarefas.json      # "Banco de dados" em JSON
│
├── requirements.txt       # Dependências Python
├── vercel.json             # Configuração de deploy da Vercel
├── .gitignore
└── README.md
```

---

## 🚀 Instalação e execução local

### Pré-requisitos

- Python 3.9 ou superior instalado ([python.org](https://www.python.org/downloads/))
- `pip` (já vem com o Python)

### Passo a passo

1. **Clone ou baixe o projeto** e entre na pasta:

   ```bash
   cd task-manager
   ```

2. **Crie um ambiente virtual** (recomendado):

   ```bash
   python3 -m venv venv
   ```

3. **Ative o ambiente virtual:**

   - Linux / macOS:
     ```bash
     source venv/bin/activate
     ```
   - Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Instale as dependências:**

   ```bash
   pip install -r requirements.txt
   ```

5. **Execute a aplicação:**

   ```bash
   python api/index.py
   ```

6. **Acesse no navegador:**

   ```text
   http://localhost:5000
   ```

Pronto! A aplicação já estará funcionando localmente, salvando as tarefas em `data/tarefas.json`.

---

## ☁️ Deploy na Vercel

A Vercel executa este projeto como uma **função serverless Python**, sem precisar de Docker nem de configuração de servidor.

### Passo a passo

1. **Crie uma conta** em [vercel.com](https://vercel.com) (pode entrar com sua conta do GitHub).

2. **Suba o projeto para um repositório no GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Primeiro commit do Task Manager"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/task-manager.git
   git push -u origin main
   ```

3. **Importe o repositório na Vercel:**
   - Acesse o painel da Vercel → **Add New → Project**
   - Selecione o repositório `task-manager`
   - A Vercel detecta automaticamente o arquivo `vercel.json` e o runtime Python — não é necessário alterar nenhuma configuração de build
   - Clique em **Deploy**

4. **Pronto!** Em poucos segundos você receberá uma URL pública, por exemplo:

   ```text
   https://task-manager-seu-usuario.vercel.app
   ```

### ⚠️ Observação importante sobre o armazenamento em produção

Funções serverless da Vercel possuem sistema de arquivos **somente leitura**, com exceção da pasta temporária `/tmp`. Por isso, o backend detecta automaticamente quando está rodando na Vercel (variável de ambiente `VERCEL`) e passa a gravar as tarefas em `/tmp/tarefas.json` em vez do arquivo original.

Isso mantém o app 100% funcional (criar, editar, excluir e concluir tarefas) sem precisar de nenhum banco de dados externo — mas é bom saber que **os dados são reiniciados a cada novo "cold start"** da função (por exemplo, após um novo deploy ou período de inatividade). Para um projeto real em produção, o recomendado seria trocar o armazenamento por um banco de dados (Postgres, Redis, etc.). Para fins de estudo e portfólio, o comportamento atual é perfeitamente adequado.

---

## 🔌 API — Endpoints

| Método | Rota                      | Descrição                                  |
|--------|---------------------------|---------------------------------------------|
| GET    | `/api/tasks`               | Lista todas as tarefas                      |
| POST   | `/api/tasks`               | Cria uma nova tarefa                        |
| PUT    | `/api/tasks/<id>`           | Edita título/descrição de uma tarefa        |
| DELETE | `/api/tasks/<id>`           | Exclui uma tarefa                           |
| PATCH  | `/api/tasks/<id>/toggle`    | Alterna entre concluída e pendente          |
| GET    | `/api/stats`                | Retorna as estatísticas do dashboard        |

### Exemplo de tarefa (JSON)

```json
{
  "id": 1,
  "titulo": "Estudar Python",
  "descricao": "Revisar funções",
  "concluida": false,
  "data_criacao": "2026-08-26"
}
```

### Exemplo de uso com `curl`

```bash
# Criar uma tarefa
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Estudar Flask", "descricao": "Ler a documentação oficial"}'

# Marcar como concluída
curl -X PATCH http://localhost:5000/api/tasks/1/toggle
```

---

## 🧠 Explicação das principais partes do código

### `api/index.py` (Backend)

- **`_get_data_path()`**: decide se o app deve ler/gravar em `data/tarefas.json` (ambiente local) ou em `/tmp/tarefas.json` (ambiente Vercel), resolvendo a limitação de sistema de arquivos somente leitura da Vercel.
- **`ler_tarefas()` / `salvar_tarefas()`**: funções responsáveis por toda a persistência — leem e escrevem a lista de tarefas no arquivo JSON.
- **`proximo_id()`**: gera um novo ID incremental, evitando duplicados.
- Cada rota (`/api/tasks`, `/api/tasks/<id>`, etc.) segue o padrão REST: `GET` para ler, `POST` para criar, `PUT` para editar, `DELETE` para remover e `PATCH` para alterar apenas o status de conclusão.
- Validações simples (por exemplo, título obrigatório) retornam código HTTP `400`; tarefas inexistentes retornam `404`.

### `templates/index.html` (Estrutura)

- Cabeçalho com logo (ícone SVG) e nome do projeto.
- Seção de **dashboard** com 4 cards de estatística.
- **Formulário** de criação de tarefas.
- **Lista de tarefas** (`<ul id="taskList">`), preenchida dinamicamente pelo JavaScript.
- Dois **modais** reutilizáveis: um para editar tarefas e outro para confirmar exclusões.
- Um container de **toasts**, onde as mensagens de feedback aparecem.

### `static/css/style.css` (Visual)

- Variáveis CSS (`:root`) centralizam cores, tipografia e espaçamentos — fácil de customizar o tema inteiro trocando poucos valores.
- Tema escuro com acento violeta (`--accent`) e um "fio" de progresso animado no topo da página, que reflete a taxa de conclusão das tarefas em tempo real.
- Cards de tarefa possuem uma borda lateral colorida (âmbar = pendente, verde = concluída) para reforçar o status visualmente.
- Media queries garantem o layout responsivo em telas menores (dashboard vira 2 colunas, formulário empilha, etc.).
- Animações de entrada/saída dos cards e toasts usam `@keyframes`, respeitando `prefers-reduced-motion`.

### `static/js/script.js` (Comportamento)

- Todas as chamadas à API usam `fetch` com `async/await`, sem nenhuma biblioteca externa.
- **Atualização otimista**: ao marcar/desmarcar uma tarefa, a interface é atualizada imediatamente (antes mesmo da resposta do servidor), e é revertida automaticamente caso a requisição falhe — dando uma sensação de app instantâneo.
- `escapeHtml()` evita que texto digitado pelo usuário seja interpretado como HTML (proteção básica contra XSS).
- Os modais de edição e exclusão controlam seu próprio estado (`idParaEditar`, `idParaExcluir`) e podem ser fechados clicando fora ou no botão "Cancelar".
- `mostrarToast()` cria dinamicamente os elementos de notificação e os remove automaticamente após alguns segundos.

---

## 💡 Possíveis melhorias futuras

- Adicionar autenticação de usuários
- Trocar o arquivo JSON por um banco de dados real (Postgres, SQLite, etc.)
- Adicionar categorias/etiquetas e prioridades às tarefas
- Drag-and-drop para reordenar tarefas

---

Feito com 🐍 Python, 🌶️ Flask e JavaScript puro.
