import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from flask import Flask, jsonify, request, render_template
from api.config import TEMPLATE_DIR, STATIC_DIR, SECRET_KEY, PORT, FLASK_ENV
from api.services.task_service import (
    get_all_tasks,
    create_task,
    update_task,
    delete_task,
    toggle_task,
    add_subtask,
    toggle_subtask,
    delete_subtask,
    clear_completed,
    get_stats,
)
from api.services.ai_service import breakdown_task_with_ai

app = Flask(
    __name__,
    template_folder=TEMPLATE_DIR,
    static_folder=STATIC_DIR,
    static_url_path="/static",
)
app.secret_key = SECRET_KEY

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/tasks", methods=["GET"])
def listar_tarefas():
    tarefas = get_all_tasks()
    tarefas_ordenadas = sorted(tarefas, key=lambda t: t.get("id", 0), reverse=True)
    return jsonify(tarefas_ordenadas), 200

@app.route("/api/tasks", methods=["POST"])
def criar_tarefa():
    dados = request.get_json(silent=True) or {}
    tarefa, erro = create_task(dados)
    if erro:
        return jsonify({"erro": erro}), 400
    return jsonify(tarefa), 201

@app.route("/api/tasks/<int:tarefa_id>", methods=["PUT"])
def editar_tarefa(tarefa_id):
    dados = request.get_json(silent=True) or {}
    tarefa, erro = update_task(tarefa_id, dados)
    if erro:
        status_code = 404 if erro == "Tarefa não encontrada." else 400
        return jsonify({"erro": erro}), status_code
    return jsonify(tarefa), 200

@app.route("/api/tasks/<int:tarefa_id>", methods=["DELETE"])
def excluir_tarefa(tarefa_id):
    removida = delete_task(tarefa_id)
    if not removida:
        return jsonify({"erro": "Tarefa não encontrada."}), 404
    return jsonify({"mensagem": "Tarefa excluída com sucesso."}), 200

@app.route("/api/tasks/<int:tarefa_id>/toggle", methods=["PATCH"])
def alternar_conclusao(tarefa_id):
    tarefa = toggle_task(tarefa_id)
    if tarefa is None:
        return jsonify({"erro": "Tarefa não encontrada."}), 404
    return jsonify(tarefa), 200

@app.route("/api/tasks/<int:tarefa_id>/subtasks", methods=["POST"])
def adicionar_subtarefa(tarefa_id):
    dados = request.get_json(silent=True) or {}
    titulo = dados.get("titulo")
    tarefa, erro = add_subtask(tarefa_id, titulo)
    if erro:
        return jsonify({"erro": erro}), 400
    return jsonify(tarefa), 200

@app.route("/api/tasks/<int:tarefa_id>/subtasks/<int:subtask_id>/toggle", methods=["PATCH"])
def alternar_subtarefa(tarefa_id, subtask_id):
    tarefa = toggle_subtask(tarefa_id, subtask_id)
    if tarefa is None:
        return jsonify({"erro": "Tarefa ou subtarefa não encontrada."}), 404
    return jsonify(tarefa), 200

@app.route("/api/tasks/<int:tarefa_id>/subtasks/<int:subtask_id>", methods=["DELETE"])
def remover_subtarefa(tarefa_id, subtask_id):
    tarefa = delete_subtask(tarefa_id, subtask_id)
    if tarefa is None:
        return jsonify({"erro": "Tarefa não encontrada."}), 404
    return jsonify(tarefa), 200

@app.route("/api/tasks/clear-completed", methods=["POST"])
def limpar_concluidas():
    removidas = clear_completed()
    return jsonify({"mensagem": f"{removidas} tarefas concluídas foram removidas.", "removidas": removidas}), 200

@app.route("/api/ai/breakdown", methods=["POST"])
def quebrar_com_ia():
    dados = request.get_json(silent=True) or {}
    titulo = dados.get("titulo") or ""
    descricao = dados.get("descricao") or ""
    if not titulo.strip():
        return jsonify({"erro": "Título é obrigatório para quebra de tarefas."}), 400
    subtarefas = breakdown_task_with_ai(titulo, descricao)
    return jsonify({"subtarefas": subtarefas}), 200

@app.route("/api/stats", methods=["GET"])
def estatisticas():
    return jsonify(get_stats()), 200

if __name__ == "__main__":
    app.run(debug=(FLASK_ENV == "development"), port=PORT)
