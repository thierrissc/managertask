# ✅ Easy Task

Um gerenciador de tarefas web simples, moderno e responsivo — construído com **Python + Flask** no backend e **HTML, CSS e JavaScript puro** no frontend, usando um **arquivo JSON** como armazenamento. Projeto pensado para estudo e portfólio, sem banco de dados, sem Docker e sem bibliotecas externas desnecessárias.

![status](https://img.shields.io/badge/status-pronto%20para%20uso-7c6bff)
![python](https://img.shields.io/badge/python-3.x-2fd4a5)
![flask](https://img.shields.io/badge/flask-3.x-7c6bff)


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


## 🛠️ Tecnologias

| Camada        | Tecnologia                          |
|---------------|--------------------------------------|
| Backend       | Python 3, Flask                      |
| Frontend      | HTML5, CSS3, JavaScript (vanilla)    |
| Armazenamento | Arquivo JSON (`data/tarefas.json`)   |
| Deploy        | Vercel (sem Docker, sem banco de dados) |


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


### ⚠️ Observação importante sobre o armazenamento em produção

Funções serverless da Vercel possuem sistema de arquivos **somente leitura**, com exceção da pasta temporária `/tmp`. Por isso, o backend detecta automaticamente quando está rodando na Vercel (variável de ambiente `VERCEL`) e passa a gravar as tarefas em `/tmp/tarefas.json` em vez do arquivo original.

Isso mantém o app 100% funcional (criar, editar, excluir e concluir tarefas) sem precisar de nenhum banco de dados externo — mas é bom saber que **os dados são reiniciados a cada novo "cold start"** da função (por exemplo, após um novo deploy ou período de inatividade). Para um projeto real em produção, o recomendado seria trocar o armazenamento por um banco de dados (Postgres, Redis, etc.). Para fins de estudo e portfólio, o comportamento atual é perfeitamente adequado.


## 🔌 API — Endpoints

| Método | Rota                      | Descrição                                  |
|--------|---------------------------|---------------------------------------------|
| GET    | `/api/tasks`               | Lista todas as tarefas                      |
| POST   | `/api/tasks`               | Cria uma nova tarefa                        |
| PUT    | `/api/tasks/<id>`           | Edita título/descrição de uma tarefa        |
| DELETE | `/api/tasks/<id>`           | Exclui uma tarefa                           |
| PATCH  | `/api/tasks/<id>/toggle`    | Alterna entre concluída e pendente          |
| GET    | `/api/stats`                | Retorna as estatísticas do dashboard        |





---

Feito com 🐍 Python, 🌶️ Flask e JavaScript puro.
