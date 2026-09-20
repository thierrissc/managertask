import json
import urllib.request
import urllib.error
from api.config import GEMINI_API_KEY

def breakdown_task_with_ai(title, description=""):
    title_clean = (title or "").strip()
    if not title_clean:
        return []

    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            prompt = (
                f"Você é um assistente de produtividade. Quebre a seguinte tarefa em exatamente 3 a 5 subtarefas curtas, práticas e diretas.\n"
                f"Tarefa: {title_clean}\n"
                f"Detalhes adicionais: {description}\n"
                f"Responda ESTRITAMENTE em formato JSON com uma lista de strings, por exemplo: [\"Passo 1\", \"Passo 2\", \"Passo 3\"]."
            )
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.3}
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                items = json.loads(text)
                if isinstance(items, list):
                    return [str(i).strip() for i in items if str(i).strip()]
        except Exception:
            pass

    return _fallback_breakdown(title_clean)

def _fallback_breakdown(title):
    t = title.lower()
    if any(k in t for k in ["estudar", "aprender", "curso", "ler", "livro", "revisar"]):
        return [
            f"Separar material e referências sobre {title}",
            "Definir cronograma e metas de estudo",
            "Fazer anotações dos pontos-chave",
            "Praticar com exercícios ou projeto de teste",
            "Revisar o conteúdo aprendido"
        ]
    elif any(k in t for k in ["comprar", "mercado", "shopping", "loja"]):
        return [
            f"Listar itens prioritários para {title}",
            "Pesquisar preços e comparar lojas",
            "Checar orçamento disponível",
            "Realizar a compra e conferir comprovante"
        ]
    elif any(k in t for k in ["projeto", "app", "site", "sistema", "desenvolver", "codar", "api"]):
        return [
            f"Planejar arquitetura e requisitos de {title}",
            "Configurar ambiente e repositório",
            "Implementar funcionalidades principais",
            "Realizar testes e correções",
            "Publicar e documentar o projeto"
        ]
    elif any(k in t for k in ["limpar", "organizar", "arrumar", "faxina"]):
        return [
            "Separar o que não é mais usado para descarte ou doação",
            "Limpar superfícies e áreas principais",
            "Organizar gavetas e prateleiras",
            "Finalizar e checar se tudo está no lugar"
        ]
    else:
        return [
            f"Definir o escopo inicial de {title}",
            "Executar a etapa principal",
            "Revisar e validar o resultado final"
        ]
