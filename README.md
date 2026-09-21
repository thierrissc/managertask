<div align="center">

# ManagerTask

Gerenciador de tarefas inteligente, moderno e interativo com suporte a checklist, tarefas recorrentes (diárias, semanais, mensais e anuais) e quebra de tarefas com inteligência artificial.

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

## Funcionalidades

- **Tarefas Recorrentes com Auto Reset**:
  - Repetição diária, semanal, mensal e anual.
  - Tarefas diárias concluídas são automaticamente renovadas no início de cada novo dia, desmarcando o checklist para recomeçar o hábito.

- **Filtros e Organização**:
  - Filtro por status (Todas, Pendentes, Concluídas).
  - Filtro por frequência (Todas, Diárias, Semanais, Mensais, Anuais, Única vez).
  - Ordenação por recentes, prioridade, repetição, prazo e ordem alfabética.

- **Checklist Padronizado**:
  - Acompanhamento de subtarefas com barra uniforme, progresso e expansão rápida.

- **Assistente com IA**:
  - Quebra inteligente de tarefas complexas em etapas práticas com o Google Gemini.

- **Persistência por IP**:
  - Dados salvos localmente e particionados pelo IP da sua rede, permitindo usar no computador e no celular sem necessidade de cadastro.

- **Interface Moderna**:
  - Fundo animado 3D em Three.js, barra de progresso com gradiente e efeitos táteis.

## Como Executar

### Pré-requisitos
- Python 3.9+ instalado
- `pip`

### 1. Configurar variáveis de ambiente (Opcional)
```bash
cp .env.example .env
```
Adicione sua chave `GEMINI_API_KEY` se desejar usar os recursos de inteligência artificial.

### 2. Instalar dependências
```bash
pip install -r requirements.txt
```

### 3. Iniciar o projeto
```bash
python api/index.py
```

Acesse no navegador: [http://localhost:5000](http://localhost:5000)
