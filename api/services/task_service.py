import json
import os
from datetime import datetime, date
from api.config import DATA_FILE, IS_VERCEL

def _get_storage_path():
    if IS_VERCEL:
        tmp_file = "/tmp/tarefas.json"
        if not os.path.exists(tmp_file):
            initial_data = "{}"
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, "r", encoding="utf-8") as f:
                        initial_data = f.read()
                except Exception:
                    initial_data = "{}"
            try:
                with open(tmp_file, "w", encoding="utf-8") as f:
                    f.write(initial_data)
            except Exception:
                pass
        return tmp_file
    return DATA_FILE

def _get_default_tasks():
    today_str = datetime.now().strftime("%Y-%m-%d")
    return [
        {
            "id": 1,
            "titulo": "Estudar para concurso",
            "descricao": "Focar nas disciplinas de maior peso do edital, fazer resumos esquematizados e praticar resolução de questões comentadas.",
            "prioridade": "alta",
            "categoria": "estudos",
            "data_vencimento": "",
            "hora_vencimento": "",
            "subtarefas": [
                {"id": 1, "titulo": "Revisar Direito Constitucional", "concluida": False},
                {"id": 2, "titulo": "Resolver 30 questões de Português", "concluida": False},
                {"id": 3, "titulo": "Simulado prático de Redação", "concluida": False}
            ],
            "concluida": False,
            "data_criacao": today_str,
            "data_conclusao": None
        },
        {
            "id": 2,
            "titulo": "Estudar para prova",
            "descricao": "Revisar anotações de aula, fórmulas fundamentais e refazer os exercícios mais desafiadores da lista recomendada.",
            "prioridade": "media",
            "categoria": "estudos",
            "data_vencimento": "",
            "hora_vencimento": "",
            "subtarefas": [
                {"id": 1, "titulo": "Leitura e resumo dos capítulos 3 e 4", "concluida": False},
                {"id": 2, "titulo": "Refazer lista de exercícios práticos", "concluida": False}
            ],
            "concluida": False,
            "data_criacao": today_str,
            "data_conclusao": None
        }
    ]

def _read_raw_store():
    path = _get_storage_path()
    if not os.path.exists(path):
        return {"_by_ip": {}}
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return {"_by_ip": {}}
            if isinstance(data, dict):
                if "_by_ip" not in data:
                    data = {"_by_ip": data}
                return data
            return {"_by_ip": {}}
    except Exception:
        return {"_by_ip": {}}

def _save_raw_store(store):
    path = _get_storage_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(store, f, ensure_ascii=False, indent=2)

def get_all_tasks(client_ip="127.0.0.1"):
    client_ip = (client_ip or "127.0.0.1").strip()
    store = _read_raw_store()
    by_ip = store.setdefault("_by_ip", {})

    if client_ip not in by_ip:
        by_ip[client_ip] = {
            "initialized": True,
            "tasks": _get_default_tasks()
        }
        _save_raw_store(store)

    user_data = by_ip.get(client_ip) or {}
    tasks = user_data.get("tasks", [])
    if not isinstance(tasks, list):
        tasks = []

    for t in tasks:
        t.setdefault("prioridade", "media")
        t.setdefault("categoria", "geral")
        t.setdefault("data_vencimento", "")
        t.setdefault("hora_vencimento", "")
        t.setdefault("subtarefas", [])
        t.setdefault("data_conclusao", None)

    return tasks

def save_all_tasks(tasks, client_ip="127.0.0.1"):
    client_ip = (client_ip or "127.0.0.1").strip()
    store = _read_raw_store()
    by_ip = store.setdefault("_by_ip", {})
    by_ip[client_ip] = {
        "initialized": True,
        "tasks": tasks
    }
    _save_raw_store(store)

def next_task_id(tasks):
    if not tasks:
        return 1
    return max(int(t.get("id", 0)) for t in tasks) + 1

def create_task(data, client_ip="127.0.0.1"):
    titulo = (data.get("titulo") or "").strip()
    if not titulo:
        return None, "O título da tarefa é obrigatório."

    tasks = get_all_tasks(client_ip)
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    subtarefas_raw = data.get("subtarefas") or []
    subtarefas = []
    sub_id = 1
    for item in subtarefas_raw:
        sub_title = item.get("titulo", "").strip() if isinstance(item, dict) else str(item).strip()
        if sub_title:
            subtarefas.append({
                "id": sub_id,
                "titulo": sub_title,
                "concluida": bool(item.get("concluida", False)) if isinstance(item, dict) else False
            })
            sub_id += 1

    new_task = {
        "id": next_task_id(tasks),
        "titulo": titulo,
        "descricao": (data.get("descricao") or "").strip(),
        "prioridade": data.get("prioridade", "media") if data.get("prioridade") in ["alta", "media", "baixa"] else "media",
        "categoria": (data.get("categoria") or "geral").strip().lower(),
        "data_vencimento": (data.get("data_vencimento") or "").strip(),
        "hora_vencimento": (data.get("hora_vencimento") or "").strip(),
        "subtarefas": subtarefas,
        "concluida": False,
        "data_criacao": today_str,
        "data_conclusao": None
    }

    tasks.append(new_task)
    save_all_tasks(tasks, client_ip)
    return new_task, None

def update_task(task_id, data, client_ip="127.0.0.1"):
    tasks = get_all_tasks(client_ip)
    task = next((t for t in tasks if t.get("id") == task_id), None)
    if not task:
        return None, "Tarefa não encontrada."

    novo_titulo = (data.get("titulo") or "").strip()
    if not novo_titulo:
        return None, "O título da tarefa é obrigatório."

    task["titulo"] = novo_titulo
    if "descricao" in data:
        task["descricao"] = (data.get("descricao") or "").strip()
    if "prioridade" in data and data["prioridade"] in ["alta", "media", "baixa"]:
        task["prioridade"] = data["prioridade"]
    if "categoria" in data:
        task["categoria"] = (data.get("categoria") or "geral").strip().lower()
    if "data_vencimento" in data:
        task["data_vencimento"] = (data.get("data_vencimento") or "").strip()
    if "hora_vencimento" in data:
        task["hora_vencimento"] = (data.get("hora_vencimento") or "").strip()
    if "subtarefas" in data and isinstance(data["subtarefas"], list):
        task["subtarefas"] = data["subtarefas"]

    save_all_tasks(tasks, client_ip)
    return task, None

def delete_task(task_id, client_ip="127.0.0.1"):
    tasks = get_all_tasks(client_ip)
    filtered = [t for t in tasks if t.get("id") != task_id]
    if len(filtered) == len(tasks):
        return False
    save_all_tasks(filtered, client_ip)
    return True

def toggle_task(task_id, client_ip="127.0.0.1"):
    tasks = get_all_tasks(client_ip)
    task = next((t for t in tasks if t.get("id") == task_id), None)
    if not task:
        return None
    task["concluida"] = not task.get("concluida", False)
    if task["concluida"]:
        task["data_conclusao"] = datetime.now().strftime("%Y-%m-%d")
        for sub in task.get("subtarefas", []):
            sub["concluida"] = True
    else:
        task["data_conclusao"] = None
    save_all_tasks(tasks, client_ip)
    return task

def add_subtask(task_id, subtask_title, client_ip="127.0.0.1"):
    title = (subtask_title or "").strip()
    if not title:
        return None, "Título do item obrigatório."
    tasks = get_all_tasks(client_ip)
    task = next((t for t in tasks if t.get("id") == task_id), None)
    if not task:
        return None, "Tarefa não encontrada."
    
    subtasks = task.setdefault("subtarefas", [])
    sub_id = max([s.get("id", 0) for s in subtasks], default=0) + 1
    new_sub = {"id": sub_id, "titulo": title, "concluida": False}
    subtasks.append(new_sub)
    
    save_all_tasks(tasks, client_ip)
    return task, None

def toggle_subtask(task_id, subtask_id, client_ip="127.0.0.1"):
    tasks = get_all_tasks(client_ip)
    task = next((t for t in tasks if t.get("id") == task_id), None)
    if not task:
        return None
    sub = next((s for s in task.get("subtarefas", []) if s.get("id") == subtask_id), None)
    if not sub:
        return None
    sub["concluida"] = not sub.get("concluida", False)
    
    all_subs = task.get("subtarefas", [])
    if all_subs and all(s.get("concluida") for s in all_subs):
        task["concluida"] = True
        task["data_conclusao"] = datetime.now().strftime("%Y-%m-%d")
    
    save_all_tasks(tasks, client_ip)
    return task

def delete_subtask(task_id, subtask_id, client_ip="127.0.0.1"):
    tasks = get_all_tasks(client_ip)
    task = next((t for t in tasks if t.get("id") == task_id), None)
    if not task:
        return None
    task["subtarefas"] = [s for s in task.get("subtarefas", []) if s.get("id") != subtask_id]
    save_all_tasks(tasks, client_ip)
    return task

def clear_completed(client_ip="127.0.0.1"):
    tasks = get_all_tasks(client_ip)
    remaining = [t for t in tasks if not t.get("concluida")]
    removed_count = len(tasks) - len(remaining)
    save_all_tasks(remaining, client_ip)
    return removed_count

def get_stats(client_ip="127.0.0.1"):
    tasks = get_all_tasks(client_ip)
    total = len(tasks)
    concluidas = sum(1 for t in tasks if t.get("concluida"))
    pendentes = total - concluidas
    taxa = round((concluidas / total) * 100) if total > 0 else 0

    today_str = date.today().isoformat()
    atrasadas = 0
    alta_prioridade = 0
    for t in tasks:
        if not t.get("concluida"):
            due = t.get("data_vencimento")
            if due and due < today_str:
                atrasadas += 1
            if t.get("prioridade") == "alta":
                alta_prioridade += 1

    return {
        "total": total,
        "concluidas": concluidas,
        "pendentes": pendentes,
        "taxa_conclusao": taxa,
        "atrasadas": atrasadas,
        "alta_prioridade": alta_prioridade
    }
