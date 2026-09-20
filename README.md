# Task Manager PRO

Um gerenciador de tarefas web moderno, inteligente e de alta performance — construído com **Python + Flask** modular no backend e **HTML5, CSS3 avançado com gradientes animados e JavaScript puro** no frontend, usando persistência em JSON e integração segura com IA via servidor.

![status](https://img.shields.io/badge/status-pronto%20para%20uso-6366f1)
![python](https://img.shields.io/badge/python-3.x-10b981)
![flask](https://img.shields.io/badge/flask-3.x-8b5cf6)

---

## Destaques & Funcionalidades

- **Design System Moderno**:
  - Tema escuro profundo com malha de iluminação indireta (`radial-gradient`).
  - Gradientes animados fluidos em botões de ação e barras de progresso.
  - Efeitos de glassmorphism e micro-interações táteis.
- **Prioridades & Categorias**:
  - Níveis de prioridade (*Alta*, *Média*, *Baixa*) com badges coloridos.
  - Categorias / Tags inteligentes (*Trabalho*, *Pessoal*, *Estudos*, *Urgente*, *Ideias*).
- **Prazos & Datas de Vencimento**:
  - Alerta inteligente de tarefas no prazo, hoje, amanhã ou atrasadas.
  - Mini calendário interativo para navegação e filtro por dia.
- **Subtarefas & Checklist**:
  - Adição e acompanhamento de subtarefas dentro de cada tarefa com contagem e progresso.
- **Assistente com IA (Server-Side Proxy)**:
  - Quebra automática de tarefas em subtarefas práticas com inteligência artificial.
  - A chave da API Gemini é configurada estritamente no backend (`.env`), nunca sendo exposta ao navegador do cliente. Possui fallback inteligente caso nenhuma chave esteja configurada.
- **Busca em Tempo Real & Atalhos de Teclado**:
  - Barra de busca instantânea por título, descrição ou categoria.
  - Atalhos: `N` para nova tarefa, `/` para pesquisar e `Esc` para fechar modais.
- **Áudio & Feedback Tátil**:
  - Efeito sonoro suave gerado nativamente via Web Audio API ao concluir tarefas.
- **Ações em Massa & Backup**:
  - Remoção em lote de tarefas concluídas.
  - Exportação de dados em arquivo `.json`.

---

## Estrutura do Projeto

```text
task-manager/
│
├── api/
│   ├── index.py                  # Entrypoint Flask, rotas REST e Vercel serverless
│   ├── config.py                 # Configurações, diretórios e leitor de .env
│   └── services/
│       ├── task_service.py       # Persistência JSON, subtarefas e métricas
│       └── ai_service.py         # Assistente de IA seguro (backend proxy)
│
├── templates/
│   └── index.html                # Interface semântica com dashboard e modais
│
├── static/
│   ├── css/
│   │   └── style.css             # Estilos modernos com gradientes animados
│   ├── js/
│   │   └── script.js             # Lógica reativa, atalhos, checklist e áudio
│   └── favicon.svg               # Ícone do aplicativo
│
├── data/
│   └── tarefas.json              # Armazenamento base em JSON
│
├── .env.example                  # Modelo de variáveis de ambiente
├── requirements.txt              # Dependências Python
├── vercel.json                   # Configuração serverless da Vercel
├── .gitignore                    # Arquivos ignorados (.env protegido)
└── README.md
```

---

## Instalação e Execução Local

### Pré-requisitos
- Python 3.9+ instalado
- `pip`

### 1. Configurar variáveis de ambiente (Opcional)
Copie o arquivo de exemplo para criar seu `.env`:
```bash
cp .env.example .env
```
Adicione sua chave `GEMINI_API_KEY` se desejar utilizar o modelo Gemini do Google para quebra automática de tarefas.

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Iniciar o servidor
```bash
python api/index.py
```

Acesse em: [http://localhost:5000](http://localhost:5000)

---

## API REST

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/tasks` | Lista todas as tarefas |
| `POST` | `/api/tasks` | Cria uma nova tarefa (com prioridade, tag, prazo e subtarefas) |
| `PUT` | `/api/tasks/<id>` | Atualiza dados e subtarefas de uma tarefa |
| `DELETE` | `/api/tasks/<id>` | Exclui uma tarefa |
| `PATCH` | `/api/tasks/<id>/toggle` | Alterna status de conclusão |
| `POST` | `/api/tasks/<id>/subtasks` | Adiciona subtarefa ao item |
| `PATCH` | `/api/tasks/<id>/subtasks/<sub_id>/toggle` | Alterna conclusão de uma subtarefa |
| `DELETE` | `/api/tasks/<id>/subtasks/<sub_id>` | Remove uma subtarefa |
| `POST` | `/api/tasks/clear-completed` | Limpa em massa tarefas concluídas |
| `POST` | `/api/ai/breakdown` | Quebra de tarefa via IA no backend |
| `GET` | `/api/stats` | Estatísticas completas do dashboard |

---

## Deploy na Vercel

O projeto está pronto para a Vercel através do arquivo [vercel.json](file:///d:/projetos-git/managertask/vercel.json). Na Vercel, o armazenamento utiliza `/tmp/tarefas.json` para permitir gravação nas funções serverless. Para configurar a chave de IA na Vercel, basta adicionar `GEMINI_API_KEY` nas variáveis de ambiente da plataforma.
