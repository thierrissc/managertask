import json
import os
from datetime import datetime

from flask import Flask, jsonify, request, render_template

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")
DATA_FILE = os.path.join(BASE_DIR, "data", "tarefas.json")

app = Flask(
    __name__,
    template_folder=TEMPLATE_DIR,
    static_folder=STATIC_DIR,
    static_url_path="/static",
)


def _get_data_path():

    if os.environ.get("VERCEL"):
        tmp_file = "/tmp/tarefas.json"
        if not os.path.exists(tmp_file):
            conteudo_inicial = "[]"
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    conteudo_inicial = f.read()
            with open(tmp_file, "w", encoding="utf-8") as f:
                f.write(conteudo_inicial)
        return tmp_file
    return DATA_FILE


def ler_tarefas():
    """Lê e retorna a lista de tarefas armazenadas no arquivo JSON."""
    caminho = _get_data_path()
    if not os.path.exists(caminho):
        return []
    try:
        with open(caminho, "r", encoding="utf-8") as arquivo:
            return json.load(arquivo)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def salvar_tarefas(tarefas):
    caminho = _get_data_path()
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as arquivo:
        json.dump(tarefas, arquivo, ensure_ascii=False, indent=2)


def proximo_id(tarefas):
    if not tarefas:
        return 1
    return max(tarefa["id"] for tarefa in tarefas) + 1


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def listar_tarefas():
    tarefas = ler_tarefas()
    tarefas_ordenadas = sorted(tarefas, key=lambda t: t["id"], reverse=True)
    return jsonify(tarefas_ordenadas), 200


@app.route("/api/tasks", methods=["POST"])
def criar_tarefa():
    """Cria uma nova tarefa a partir do JSON enviado no corpo da requisição."""
    dados = request.get_json(silent=True) or {}
    titulo = (dados.get("titulo") or "").strip()
    descricao = (dados.get("descricao") or "").strip()

    if not titulo:
        return jsonify({"erro": "O título da tarefa é obrigatório."}), 400

    tarefas = ler_tarefas()
    nova_tarefa = {
        "id": proximo_id(tarefas),
        "titulo": titulo,
        "descricao": descricao,
        "concluida": False,
        "data_criacao": datetime.now().strftime("%Y-%m-%d"),
    }

    tarefas.append(nova_tarefa)
    salvar_tarefas(tarefas)

    return jsonify(nova_tarefa), 201


@app.route("/api/tasks/<int:tarefa_id>", methods=["PUT"])
def editar_tarefa(tarefa_id):
    """Atualiza o título e/ou a descrição de uma tarefa existente."""
    dados = request.get_json(silent=True) or {}
    tarefas = ler_tarefas()

    tarefa = next((t for t in tarefas if t["id"] == tarefa_id), None)
    if tarefa is None:
        return jsonify({"erro": "Tarefa não encontrada."}), 404

    novo_titulo = (dados.get("titulo") or "").strip()
    if not novo_titulo:
        return jsonify({"erro": "O título da tarefa é obrigatório."}), 400

    tarefa["titulo"] = novo_titulo
    tarefa["descricao"] = (dados.get("descricao") or "").strip()

    salvar_tarefas(tarefas)
    return jsonify(tarefa), 200


@app.route("/api/tasks/<int:tarefa_id>", methods=["DELETE"])
def excluir_tarefa(tarefa_id):
    """Remove uma tarefa da lista pelo seu ID."""
    tarefas = ler_tarefas()
    tarefas_restantes = [t for t in tarefas if t["id"] != tarefa_id]

    if len(tarefas_restantes) == len(tarefas):
        return jsonify({"erro": "Tarefa não encontrada."}), 404

    salvar_tarefas(tarefas_restantes)
    return jsonify({"mensagem": "Tarefa excluída com sucesso."}), 200


@app.route("/api/tasks/<int:tarefa_id>/toggle", methods=["PATCH"])
def alternar_conclusao(tarefa_id):
    """Alterna o status de uma tarefa entre concluída e pendente."""
    tarefas = ler_tarefas()
    tarefa = next((t for t in tarefas if t["id"] == tarefa_id), None)

    if tarefa is None:
        return jsonify({"erro": "Tarefa não encontrada."}), 404

    tarefa["concluida"] = not tarefa["concluida"]
    salvar_tarefas(tarefas)

    return jsonify(tarefa), 200


@app.route("/api/stats", methods=["GET"])
def estatisticas():
    """Calcula e retorna os números exibidos nos cards do dashboard."""
    tarefas = ler_tarefas()
    total = len(tarefas)
    concluidas = sum(1 for t in tarefas if t["concluida"])
    pendentes = total - concluidas
    taxa_conclusao = round((concluidas / total) * 100) if total > 0 else 0

    return (
        jsonify(
            {
                "total": total,
                "concluidas": concluidas,
                "pendentes": pendentes,
                "taxa_conclusao": taxa_conclusao,
            }
        ),
        200,
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
