import json
import urllib.request
import urllib.error
import re
from api.config import GEMINI_API_KEY

def breakdown_task_with_ai(title, description=""):
    title_clean = (title or "").strip()
    if not title_clean:
        return []

    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            prompt = (
                "Você é um planejador de tarefas de alto nível. "
                "Decomponha a seguinte tarefa em exatamente 3 a 4 passos práticos, objetivos e acionáveis. "
                "REGRAS OBRIGATÓRIAS:\n"
                "1. NUNCA use frases pré-fabricadas genéricas como 'Definir escopo inicial', 'Separar materiais para...', 'Executar a tarefa'.\n"
                "2. Cada subtarefa deve ser um passo concreto do mundo real específico para o assunto.\n"
                "3. Responda ESTRITAMENTE em formato JSON com array de strings, exemplo: [\"Passo A\", \"Passo B\", \"Passo C\"].\n\n"
                f"Tarefa: {title_clean}\n"
                f"Notas: {description}"
            )
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.4,
                    "responseMimeType": "application/json"
                }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=9) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                items = json.loads(text)
                if isinstance(items, list) and len(items) > 0:
                    return [str(i).strip() for i in items if str(i).strip()]
        except Exception:
            pass

    return _generate_contextual_breakdown(title_clean)

def suggest_new_tasks_with_ai(previous_tasks=None):
    previous_tasks = previous_tasks or []
    history_summary = []
    for t in previous_tasks[:15]:
        tit = t.get("titulo", "").strip()
        desc = t.get("descricao", "").strip()
        status = "concluída" if t.get("concluida") else "pendente"
        if tit:
            item_str = f"- {tit} ({status})"
            if desc:
                item_str += f": {desc}"
            history_summary.append(item_str)
    
    history_text = "\n".join(history_summary) if history_summary else "Nenhuma tarefa anterior cadastrada ainda."

    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            prompt = (
                "Você é um assistente de produtividade e planejamento de alto nível. "
                "Com base no histórico de tarefas anteriores do usuário abaixo, sugira exatamente 3 novas atividades inteligentes, realistas e úteis que complementem o que ele já faz ou planeja (por exemplo: se estuda para algo, sugerir 'Buscar certificado de algo', 'Fazer simulado', 'Estudar tópico X'; se programa ou trabalha, sugerir certificações, projetos práticos ou revisões). "
                "REGRAS OBRIGATÓRIAS:\n"
                "1. Sugira atividades personalizadas ao perfil identificado no histórico.\n"
                "2. Retorne ESTRITAMENTE um JSON com uma lista de 3 objetos com os campos:\n"
                "   - 'titulo': título conciso e acionável da tarefa\n"
                "   - 'descricao': 1 a 2 frases explicando o objetivo\n"
                "   - 'prioridade': 'alta', 'media' ou 'baixa'\n"
                "   - 'recorrencia': 'unica', 'diaria', 'semanal', 'mensal' ou 'anual'\n"
                "   - 'subtarefas': lista com 3 a 4 passos práticos como checklist\n\n"
                f"Histórico de tarefas do usuário:\n{history_text}"
            )
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.5,
                    "responseMimeType": "application/json"
                }
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=9) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                items = json.loads(text)
                if isinstance(items, list) and len(items) > 0:
                    valid_items = []
                    for it in items:
                        if isinstance(it, dict) and it.get("titulo"):
                            valid_items.append({
                                "titulo": str(it.get("titulo", "")).strip(),
                                "descricao": str(it.get("descricao", "")).strip(),
                                "prioridade": str(it.get("prioridade", "media")).lower(),
                                "recorrencia": str(it.get("recorrencia", "unica")).lower(),
                                "subtarefas": [str(s).strip() for s in it.get("subtarefas", []) if str(s).strip()]
                            })
                    if valid_items:
                        return valid_items
        except Exception:
            pass

    return _generate_contextual_task_suggestions(previous_tasks)

def _generate_contextual_task_suggestions(previous_tasks):
    all_text = " ".join([
        (t.get("titulo", "") + " " + t.get("descricao", "")).lower()
        for t in previous_tasks
    ])

    suggestions = []

    # Detect study / exam / contest topics
    if any(k in all_text for k in ["estudar", "estudo", "concurso", "prova", "edital", "simulado", "curso", "faculdade"]):
        suggestions.append({
            "titulo": "Buscar certificado de curso concluído",
            "descricao": "Localizar e emitir comprovantes e certificados de cursos concluídos para horas complementares ou currículo.",
            "prioridade": "media",
            "recorrencia": "unica",
            "subtarefas": [
                "Acessar plataforma de cursos ou instituição",
                "Verificar notas e requisitos para emissão",
                "Fazer download do PDF e salvar no Drive",
                "Anexar comprovante ao currículo ou perfil"
            ]
        })
        suggestions.append({
            "titulo": "Resolver simulado cronometrado de questões",
            "descricao": "Treinar resolução de questões no tempo oficial de prova para fixar conteúdos e medir desempenho.",
            "prioridade": "alta",
            "recorrencia": "semanal",
            "subtarefas": [
                "Filtrar banca e matérias mais cobradas",
                "Programar cronômetro sem interrupções",
                "Resolver caderno de 30 a 50 questões",
                "Analisar erros e revisar gabarito comentado"
            ]
        })
        suggestions.append({
            "titulo": "Revisar resumos e mapas mentais",
            "descricao": "Revisão ativa periódica dos tópicos estudados para consolidar memória de longo prazo.",
            "prioridade": "media",
            "recorrencia": "diaria",
            "subtarefas": [
                "Selecionar disciplina do dia",
                "Revisar anotações e pontos de atenção",
                "Resolver 5 questões rápidas de fixação"
            ]
        })
        return suggestions

    # Detect tech / dev topics
    if any(k in all_text for k in ["python", "javascript", "react", "dev", "codigo", "api", "sistema", "programar", "deploy"]):
        suggestions.append({
            "titulo": "Buscar certificado de formação técnica",
            "descricao": "Emitir certificados de cursos e trilhas de desenvolvimento concluídas para atualizar o perfil profissional.",
            "prioridade": "media",
            "recorrencia": "unica",
            "subtarefas": [
                "Acessar plataforma de ensino e gerar certificado",
                "Validar código de autenticidade",
                "Publicar certificado no LinkedIn e portfólio"
            ]
        })
        suggestions.append({
            "titulo": "Estudar arquitetura limpa e boas práticas",
            "descricao": "Aprofundar em padrões de projeto, testes automatizados e estrutura de código escalável.",
            "prioridade": "alta",
            "recorrencia": "semanal",
            "subtarefas": [
                "Pesquisar referências e artigos sobre o tema",
                "Aplicar refatoração em um módulo prático",
                "Escrever testes unitários de validação"
            ]
        })
        suggestions.append({
            "titulo": "Construir projeto prático de portfólio",
            "descricao": "Desenvolver funcionalidade completa para demonstrar habilidades técnicas aplicadas.",
            "prioridade": "alta",
            "recorrencia": "unica",
            "subtarefas": [
                "Desenhar wireframe e modelar banco de dados",
                "Implementar regras de negócio e rotas",
                "Publicar repositório com README detalhado"
            ]
        })
        return suggestions

    # Default / General productivity suggestions
    suggestions.append({
        "titulo": "Buscar certificado de capacitação ou curso",
        "descricao": "Conferir pendências de certificações em plataformas de ensino e arquivar comprovantes.",
        "prioridade": "media",
        "recorrencia": "unica",
        "subtarefas": [
            "Listar cursos e treinamentos finalizados",
            "Acessar ambiente de emissão e gerar PDFs",
            "Organizar certificados em pasta na nuvem",
            "Atualizar LinkedIn com novas qualificações"
        ]
    })
    suggestions.append({
        "titulo": "Estudar tema prioritário para desenvolvimento",
        "descricao": "Dedicar um bloco de tempo sem distrações para ler ou assistir conteúdos relevantes.",
        "prioridade": "alta",
        "recorrencia": "semanal",
        "subtarefas": [
            "Definir tópico principal a ser estudado",
            "Separar material de estudo e bibliografia",
            "Criar anotações práticas e resumo dos pontos-chave",
            "Aplicar conceito em um mini-exercício"
        ]
    })
    suggestions.append({
        "titulo": "Planejar metas e organização da semana",
        "descricao": "Estruturar compromissos, tarefas prioritárias e prazos para manter alto rendimento.",
        "prioridade": "baixa",
        "recorrencia": "semanal",
        "subtarefas": [
            "Listar top 3 prioridades inegociáveis",
            "Revisar pendências da semana anterior",
            "Distribuir blocos de foco no calendário"
        ]
    })
    return suggestions

def _generate_contextual_breakdown(text):
    clean = text.lower()
    
    if any(k in clean for k in ["python", "flask", "django", "fastapi"]):
        return [
            "Estruturar rotas e modelos de dados",
            "Configurar ambiente virtual e dependências",
            "Desenvolver lógica dos endpoints REST",
            "Validar respostas e tratar exceções"
        ]
    if any(k in clean for k in ["react", "vue", "angular", "next", "front", "css", "layout"]):
        return [
            "Esboçar hierarquia de componentes e estado",
            "Implementar estilos e tema visual",
            "Integrar chamadas com a API",
            "Ajustar responsividade e micro-interações"
        ]
    if any(k in clean for k in ["bug", "erro", "fix", "consertar", "corrigir"]):
        return [
            "Reproduzir o erro e inspecionar logs",
            "Isolar a linha ou componente defeituoso",
            "Aplicar correção e refatorar trecho",
            "Executar testes para garantir estabilidade"
        ]
    if any(k in clean for k in ["deploy", "publicar", "producao", "vercel", "nuvem"]):
        return [
            "Verificar variáveis de ambiente e segredos",
            "Executar build local para conferir erros",
            "Subir commit e acionar pipeline de deploy",
            "Homologar funcionamento em produção"
        ]
    if any(k in clean for k in ["estudar", "ler", "aprender", "curso", "aula"]):
        words = [w for w in re.findall(r"\b\w+\b", text) if len(w) > 3 and w.lower() not in ["estudar", "aprender", "curso", "para", "sobre", "como"]]
        subject = (" de " + " ".join(words[:2])) if words else ""
        return [
            f"Mapear conceitos fundamentais{subject}",
            "Fazer anotações práticas e exemplos de código",
            "Construir um mini-exercício de fixação",
            "Sintetizar os aprendizados em um resumo"
        ]
    if any(k in clean for k in ["mercado", "comprar", "supermercado", "shopping"]):
        return [
            "Conferir estoque da despensa e listar faltantes",
            "Agrupar itens por setor para economizar tempo",
            "Pesquisar preços e comparar alternativas",
            "Adquirir os produtos e conferir nota fiscal"
        ]
    if any(k in clean for k in ["treino", "academia", "exercicio", "correr", "treinar"]):
        return [
            "Aquecimento articular e ativação muscular",
            "Série principal com progressão de carga",
            "Exercícios complementares e acessórios",
            "Desaquecimento e hidratação"
        ]
    if any(k in clean for k in ["relatorio", "financeiro", "apresentacao", "slides", "reuniao"]):
        return [
            "Levantar métricas e dados consolidados",
            "Montar estrutura visual e destaques principais",
            "Revisar números e alinhar conclusões",
            "Compartilhar com os participantes"
        ]
    if any(k in clean for k in ["limpar", "organizar", "arrumar", "quarto", "casa"]):
        return [
            "Descartar itens sem uso ou acumulados",
            "Higienizar superfícies e móveis principais",
            "Guardar objetos em seus locais definidos",
            "Passar pano e perfumar o ambiente"
        ]

    words = [w for w in text.split() if len(w) > 2]
    first_part = " ".join(words[:3]) if len(words) >= 3 else text
    return [
        f"Alinhar pré-requisitos para {first_part}",
        "Executar o núcleo principal da atividade",
        "Validar se todos os detalhes estão atendidos",
        "Finalizar e arquivar pendência"
    ]
