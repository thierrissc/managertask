# -*- coding: utf-8 -*-
"""
Task Manager - Backend Flask
==============================
API REST simples para gerenciar tarefas, usando um arquivo JSON como
"banco de dados". Não usa nenhum banco de dados real nem bibliotecas
externas além do Flask, para manter o projeto leve e fácil de estudar.

Endpoints disponíveis:
    GET    /api/tasks              -> lista todas as tarefas
    POST   /api/tasks              -> cria uma nova tarefa
    PUT    /api/tasks/<id>         -> edita título/descrição de uma tarefa
    DELETE /api/tasks/<id>         -> remove uma tarefa
    PATCH  /api/tasks/<id>/toggle  -> alterna concluída/pendente

    GET    /api/stats              -> estatísticas do dashboard
    GET    /                       -> página principal (index.html)
"""

import json
import os
from datetime import datetime

from flask import Flask, jsonify, request, render_template

# ---------------------------------------------------------------------------
# Configuração de caminhos
# ---------------------------------------------------------------------------
# Como este arquivo fica dentro de /api, subimos um nível para encontrar
# a raiz do projeto (onde estão /templates, /static e /data).
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


# ---------------------------------------------------------------------------
# Camada de "banco de dados" (arquivo JSON)
# ---------------------------------------------------------------------------
def _get_data_path():
    """
    Retorna o caminho do arquivo de dados a ser usado.

    Observação importante sobre o deploy na Vercel:
    Funções serverless da Vercel têm sistema de arquivos SOMENTE LEITURA,
    exceto pela pasta /tmp. Ou seja, não é possível gravar permanentemente
    em data/tarefas.json em produção. Para o projeto continuar funcionando
    (criar/editar/excluir tarefas) mesmo na Vercel, usamos /tmp/tarefas.json
    como cópia de trabalho quando detectamos que estamos rodando lá.

    Isso é suficiente para fins de estudo e portfólio, mas é importante
    saber que, na Vercel, os dados são reiniciados a cada novo "cold start"
    (o arquivo original em /data volta a ser o ponto de partida). Para um
    projeto real em produção, o ideal seria usar um banco de dados externo.
    """
    if os.environ.get("VERCEL"):
        tmp_file = "/tmp/tarefas.json"
        if not os.path.exists(tmp_file):
            # Copia o conteúdo inicial (ou começa com lista vazia)
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
    """Grava a lista de tarefas no arquivo JSON, formatada e legível."""
    caminho = _get_data_path()
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, "w", encoding="utf-8") as arquivo:
        json.dump(tarefas, arquivo, ensure_ascii=False, indent=2)


def proximo_id(tarefas):
    """Calcula o próximo ID disponível (maior id existente + 1)."""
    if not tarefas:
        return 1
    return max(tarefa["id"] for tarefa in tarefas) + 1


# ---------------------------------------------------------------------------
# Rota da página principal
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    """Renderiza a página principal (SPA simples com HTML + JS)."""
    return render_template("index.html")


# ---------------------------------------------------------------------------
# API - Listagem e criação
# ---------------------------------------------------------------------------
@app.route("/api/tasks", methods=["GET"])
def listar_tarefas():
    """Retorna todas as tarefas cadastradas, da mais recente para a mais antiga."""
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


# ---------------------------------------------------------------------------
# API - Edição e exclusão de uma tarefa específica
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# API - Estatísticas para o dashboard
# ---------------------------------------------------------------------------
@app.route("/api/stats", methods=["GET"])
def estatisticas():
    """Calcula e retorna os números exibidos nos cards do dashboard."""
    tarefas = ler_tarefas()
    total = len(tarefas)
    concluidas = sum(1 for t in tarefas if t["concluida"])
    pendentes = total - concluidas
    taxa_conclusao = round((concluidas / total) * 100) if total > 0 else 0

    return jsonify(
        {
            "total": total,
            "concluidas": concluidas,
            "pendentes": pendentes,
            "taxa_conclusao": taxa_conclusao,
        }
    ), 200


# ---------------------------------------------------------------------------
# Execução local (não é usada pela Vercel, apenas em "python api/index.py")
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
