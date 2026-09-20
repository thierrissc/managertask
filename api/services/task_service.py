import json
import os
from datetime import datetime, date
from api.config import DATA_FILE, IS_VERCEL

def _get_storage_path():
    if IS_VERCEL:
        tmp_file = "/tmp/tarefas.json"
        if not os.path.exists(tmp_file):
            initial_data = "[]"
            if os.path.exists(DATA_FILE):
                try:
                    with open(DATA_FILE, "r", encoding="utf-8") as f:
                        initial_data = f.read()
                except Exception:
                    initial_data = "[]"
            try:
                with open(tmp_file, "w", encoding="utf-8") as f:
                    f.write(initial_data)
            except Exception:
                pass
        return tmp_file
    return DATA_FILE

def get_all_tasks():
    path = _get_storage_path()
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            tasks = json.load(f)
            if not isinstance(tasks, list):
                return []
            for t in tasks:
                t.setdefault("prioridade", "media")
                t.setdefault("categoria", "geral")
                t.setdefault("data_vencimento", "")
                t.setdefault("hora_vencimento", "")
                t.setdefault("subtarefas", [])
                t.setdefault("data_conclusao", None)
            return tasks
    except Exception:
        return []

def save_all_tasks(tasks):
    path = _get_storage_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)

def next_task_id(tasks):
    if not tasks:
        return 1
    return max(int(t.get("id", 0)) for t in tasks) + 1

def create_task(data):
    titulo = (data.get("titulo") or "").strip()
    if not titulo:
        return None, "O título da tarefa é obrigatório."

    tasks = get_all_tasks()
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
    save_all_tasks(tasks)
    return new_task, None

def update_task(task_id, data):
    tasks = get_all_tasks()
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

    save_all_tasks(tasks)
    return task, None

def delete_task(task_id):
    tasks = get_all_tasks()
    filtered = [t for t in tasks if t.get("id") != task_id]
    if len(filtered) == len(tasks):
        return False
    save_all_tasks(filtered)
    return True

def toggle_task(task_id):
    tasks = get_all_tasks()
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
    save_all_tasks(tasks)
    return task

def add_subtask(task_id, subtask_title):
    title = (subtask_title or "").strip()
    if not title:
        return None, "Título do item obrigatório."
    tasks = get_all_tasks()
    task = next((t for t in tasks if t.get("id") == task_id), None)
    if not task:
        return None, "Tarefa não encontrada."
    
    subtasks = task.setdefault("subtarefas", [])
    sub_id = max([s.get("id", 0) for s in subtasks], default=0) + 1
    new_sub = {"id": sub_id, "titulo": title, "concluida": False}
    subtasks.append(new_sub)
    
    save_all_tasks(tasks)
    return task, None

def toggle_subtask(task_id, subtask_id):
    tasks = get_all_tasks()
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
    
    save_all_tasks(tasks)
    return task

def delete_subtask(task_id, subtask_id):
    tasks = get_all_tasks()
    task = next((t for t in tasks if t.get("id") == task_id), None)
    if not task:
        return None
    task["subtarefas"] = [s for s in task.get("subtarefas", []) if s.get("id") != subtask_id]
    save_all_tasks(tasks)
    return task

def clear_completed():
    tasks = get_all_tasks()
    remaining = [t for t in tasks if not t.get("concluida")]
    removed_count = len(tasks) - len(remaining)
    save_all_tasks(remaining)
    return removed_count

def get_stats():
    tasks = get_all_tasks()
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
