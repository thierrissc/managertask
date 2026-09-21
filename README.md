<div align="center">

# ManagerTask

Gerenciador de tarefas inteligente, moderno e de alta performance com suporte a checklist, tarefas recorrentes (diárias, semanais, mensais e anuais) e quebra de tarefas com inteligência artificial.

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>

</div>

## Destaques & Funcionalidades

- **Tarefas Recorrentes com Auto Reset**:
  - Suporte a repetição diária, semanal, mensal e anual.
  - Tarefas diárias concluídas são automaticamente renovadas no início de cada novo dia, desmarcando o checklist para recomeçar o hábito.
- **Filtros e Organização Inteligentes**:
  - Filtro por status (Todas, Pendentes, Concluídas).
  - Filtro por recorrência (Todas, Diárias, Semanais, Mensais, Anuais, Única vez).
  - Ordenação por data recente, prioridade, frequência/repetição, prazo e ordem alfabética.
- **Subtarefas & Checklist Padronizado**:
  - Barras de checklist uniformes e elegantes, com progresso dinâmico e expansão instantânea.
- **Assistente com Inteligência Artificial**:
  - Quebra automática de tarefas complexas em subtarefas estruturadas via Google Gemini.
  - Proxy seguro no backend protegendo a chave de API contra vazamentos.
- **Armazenamento e Privacidade por IP**:
  - As tarefas são armazenadas de forma persistente e particionadas pelo IP da rede, permitindo alternar entre computador e celular sem necessidade de login.
- **Design Moderno e Interativo**:
  - Fundo dinâmico com malha 3D animada em Three.js.
  - Gradientes suaves, tema escuro nativo e feedback auditivo ao concluir tarefas.

## Estrutura do Projeto

```text
managertask/
├── api/
│   ├── index.py                  # Servidor Flask, rotas REST e particionamento por IP
│   ├── config.py                 # Configurações do ambiente
│   └── services/
│       ├── task_service.py       # Regras de negócio, recorrência e persistência
│       └── ai_service.py         # Integração segura com IA
├── templates/
│   └── index.html                # Interface visual da aplicação
├── static/
│   ├── css/
│   │   └── style.css             # Estilos responsivos e tema escuro
│   ├── js/
│   │   └── script.js             # Lógica reativa no frontend e animações Three.js
│   └── favicon.svg               # Ícone do aplicativo
├── data/
│   └── tarefas.json              # Base de dados em JSON
├── .env.example                  # Exemplo de configuração de variáveis
├── requirements.txt              # Dependências do Python
└── README.md
```

## Instalação e Execução Local

### Pré-requisitos
- Python 3.9+ instalado
- `pip`

### 1. Configurar variáveis de ambiente (Opcional)
Copie o arquivo de exemplo:
```bash
cp .env.example .env
```
Adicione sua chave `GEMINI_API_KEY` caso deseje utilizar o assistente de IA.

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Iniciar a aplicação
```bash
python api/index.py
```

Acesse em: [http://localhost:5000](http://localhost:5000)

## API REST

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/tasks` | Retorna todas as tarefas particionadas pelo IP do cliente |
| `POST` | `/api/tasks` | Cria nova tarefa (com prioridade, recorrência, prazo e checklist) |
| `PUT` | `/api/tasks/<id>` | Atualiza dados e subtarefas de uma tarefa |
| `DELETE` | `/api/tasks/<id>` | Exclui uma tarefa |
| `PATCH` | `/api/tasks/<id>/toggle` | Alterna status de conclusão |
| `POST` | `/api/tasks/<id>/subtasks` | Adiciona um item ao checklist |
| `PATCH` | `/api/tasks/<id>/subtasks/<sub_id>/toggle` | Alterna conclusão de item do checklist |
| `DELETE` | `/api/tasks/<id>/subtasks/<sub_id>` | Remove item do checklist |
| `POST` | `/api/tasks/clear-completed` | Remove tarefas concluídas em massa |
| `POST` | `/api/ai/breakdown` | Sugestão e quebra de tarefas via IA |
| `GET` | `/api/stats` | Métricas e estatísticas em tempo real |
