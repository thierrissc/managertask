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

def get_client_ip():
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.remote_addr or "127.0.0.1"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/tasks", methods=["GET"])
def listar_tarefas():
    client_ip = get_client_ip()
    tarefas = get_all_tasks(client_ip)
    tarefas_ordenadas = sorted(tarefas, key=lambda t: t.get("id", 0), reverse=True)
    return jsonify(tarefas_ordenadas), 200

@app.route("/api/tasks", methods=["POST"])
def criar_tarefa():
    client_ip = get_client_ip()
    dados = request.get_json(silent=True) or {}
    tarefa, erro = create_task(dados, client_ip)
    if erro:
        return jsonify({"erro": erro}), 400
    return jsonify(tarefa), 201

@app.route("/api/tasks/<int:tarefa_id>", methods=["PUT"])
def editar_tarefa(tarefa_id):
    client_ip = get_client_ip()
    dados = request.get_json(silent=True) or {}
    tarefa, erro = update_task(tarefa_id, dados, client_ip)
    if erro:
        status_code = 404 if erro == "Tarefa não encontrada." else 400
        return jsonify({"erro": erro}), status_code
    return jsonify(tarefa), 200

@app.route("/api/tasks/<int:tarefa_id>", methods=["DELETE"])
def excluir_tarefa(tarefa_id):
    client_ip = get_client_ip()
    removida = delete_task(tarefa_id, client_ip)
    if not removida:
        return jsonify({"erro": "Tarefa não encontrada."}), 404
    return jsonify({"mensagem": "Tarefa excluída com sucesso."}), 200

@app.route("/api/tasks/<int:tarefa_id>/toggle", methods=["PATCH"])
def alternar_conclusao(tarefa_id):
    client_ip = get_client_ip()
    tarefa = toggle_task(tarefa_id, client_ip)
    if tarefa is None:
        return jsonify({"erro": "Tarefa não encontrada."}), 404
    return jsonify(tarefa), 200

@app.route("/api/tasks/<int:tarefa_id>/subtasks", methods=["POST"])
def adicionar_subtarefa(tarefa_id):
    client_ip = get_client_ip()
    dados = request.get_json(silent=True) or {}
    titulo = dados.get("titulo")
    tarefa, erro = add_subtask(tarefa_id, titulo, client_ip)
    if erro:
        return jsonify({"erro": erro}), 400
    return jsonify(tarefa), 200

@app.route("/api/tasks/<int:tarefa_id>/subtasks/<int:subtask_id>/toggle", methods=["PATCH"])
def alternar_subtarefa(tarefa_id, subtask_id):
    client_ip = get_client_ip()
    tarefa = toggle_subtask(tarefa_id, subtask_id, client_ip)
    if tarefa is None:
        return jsonify({"erro": "Tarefa ou subtarefa não encontrada."}), 404
    return jsonify(tarefa), 200

@app.route("/api/tasks/<int:tarefa_id>/subtasks/<int:subtask_id>", methods=["DELETE"])
def remover_subtarefa(tarefa_id, subtask_id):
    client_ip = get_client_ip()
    tarefa = delete_subtask(tarefa_id, subtask_id, client_ip)
    if tarefa is None:
        return jsonify({"erro": "Tarefa não encontrada."}), 404
    return jsonify(tarefa), 200

@app.route("/api/tasks/clear-completed", methods=["POST"])
def limpar_concluidas():
    client_ip = get_client_ip()
    removidas = clear_completed(client_ip)
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
    client_ip = get_client_ip()
    return jsonify(get_stats(client_ip)), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=(FLASK_ENV == "development"), port=PORT)
