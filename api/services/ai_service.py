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
