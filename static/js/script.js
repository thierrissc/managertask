(() => {
  "use strict";

  const taskForm = document.getElementById("taskForm");
  const tituloInput = document.getElementById("titulo");
  const descricaoInput = document.getElementById("descricao");
  const taskList = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");
  const emptyStateText = document.getElementById("emptyStateText");
  const headerDate = document.getElementById("headerDate");
  const progressThread = document.getElementById("progressThread");

  const statTotal = document.getElementById("statTotal");
  const statConcluidas = document.getElementById("statConcluidas");
  const statPendentes = document.getElementById("statPendentes");
  const statTaxa = document.getElementById("statTaxa");

  const filterButtons = document.querySelectorAll(".filter-btn");

  const editModalOverlay = document.getElementById("editModalOverlay");
  const editForm = document.getElementById("editForm");
  const editTitulo = document.getElementById("editTitulo");
  const editDescricao = document.getElementById("editDescricao");
  const btnCancelEdit = document.getElementById("btnCancelEdit");

  const confirmModalOverlay = document.getElementById("confirmModalOverlay");
  const btnCancelDelete = document.getElementById("btnCancelDelete");
  const btnConfirmDelete = document.getElementById("btnConfirmDelete");

  const toastContainer = document.getElementById("toastContainer");

  let tarefas = [];
  let filtroAtual = "todas";
  let idParaEditar = null;
  let idParaExcluir = null;

  document.addEventListener("DOMContentLoaded", () => {
    exibirDataAtual();
    carregarTarefas();
  });

  function exibirDataAtual() {
    const hoje = new Date();
    const opcoes = { weekday: "long", day: "numeric", month: "long" };
    headerDate.textContent = hoje.toLocaleDateString("pt-BR", opcoes);
  }

  async function carregarTarefas() {
    try {
      const resposta = await fetch("/api/tasks");
      if (!resposta.ok) throw new Error("Falha ao carregar tarefas.");
      tarefas = await resposta.json();
      renderizarTudo();
    } catch (erro) {
      mostrarToast("Não foi possível carregar as tarefas.", "error");
      console.error(erro);
    }
  }

  async function criarTarefa(titulo, descricao) {
    const resposta = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descricao }),
    });

    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || "Erro ao criar tarefa.");
    return dados;
  }

  async function atualizarTarefa(id, titulo, descricao) {
    const resposta = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descricao }),
    });

    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || "Erro ao editar tarefa.");
    return dados;
  }

  async function excluirTarefaAPI(id) {
    const resposta = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || "Erro ao excluir tarefa.");
    return dados;
  }

  async function alternarConclusaoAPI(id) {
    const resposta = await fetch(`/api/tasks/${id}/toggle`, {
      method: "PATCH",
    });
    const dados = await resposta.json();
    if (!resposta.ok)
      throw new Error(dados.erro || "Erro ao atualizar tarefa.");
    return dados;
  }

  taskForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const titulo = tituloInput.value.trim();
    const descricao = descricaoInput.value.trim();

    if (!titulo) {
      mostrarToast("Digite um título para a tarefa.", "error");
      return;
    }

    try {
      const novaTarefa = await criarTarefa(titulo, descricao);
      tarefas.unshift(novaTarefa);
      renderizarTudo();

      tituloInput.value = "";
      descricaoInput.value = "";
      tituloInput.focus();

      mostrarToast("Tarefa adicionada com sucesso!", "success");
    } catch (erro) {
      mostrarToast(erro.message, "error");
    }
  });

  /* ------------------------------------------------------------------------ */
  /*  Filtros (Todas / Pendentes / Concluídas)                                 */
  /* ------------------------------------------------------------------------ */
  filterButtons.forEach((botao) => {
    botao.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      botao.classList.add("is-active");
      botao.setAttribute("aria-selected", "true");
      filtroAtual = botao.dataset.filter;
      renderizarLista();
    });
  });

  /* ------------------------------------------------------------------------ */
  /*  Renderização                                                             */
  /* ------------------------------------------------------------------------ */
  function renderizarTudo() {
    renderizarLista();
    renderizarDashboard();
  }

  function tarefasFiltradas() {
    if (filtroAtual === "pendentes") return tarefas.filter((t) => !t.concluida);
    if (filtroAtual === "concluidas") return tarefas.filter((t) => t.concluida);
    return tarefas;
  }

  function renderizarLista() {
    const lista = tarefasFiltradas();
    taskList.innerHTML = "";

    if (lista.length === 0) {
      emptyState.hidden = false;
      emptyStateText.textContent =
        filtroAtual === "todas"
          ? "Nenhuma tarefa por aqui ainda. Adicione a primeira acima."
          : filtroAtual === "pendentes"
            ? "Nenhuma tarefa pendente. Bom trabalho!"
            : "Nenhuma tarefa concluída ainda.";
      return;
    }

    emptyState.hidden = true;

    lista.forEach((tarefa) => {
      taskList.appendChild(criarElementoTarefa(tarefa));
    });
  }

  function criarElementoTarefa(tarefa) {
    const li = document.createElement("li");
    li.className = `task-card${tarefa.concluida ? " is-done" : ""}`;
    li.dataset.id = tarefa.id;

    li.innerHTML = `
      <button
        class="task-checkbox${tarefa.concluida ? " is-checked" : ""}"
        aria-label="${tarefa.concluida ? "Desmarcar conclusão" : "Marcar como concluída"}"
        aria-pressed="${tarefa.concluida}"
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="task-body">
        <p class="task-title">${escapeHtml(tarefa.titulo)}</p>
        ${tarefa.descricao ? `<p class="task-description">${escapeHtml(tarefa.descricao)}</p>` : ""}
        <span class="task-date">
          <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          ${formatarData(tarefa.data_criacao)}
        </span>
      </div>

      <div class="task-actions">
        <button class="icon-btn btn-edit" aria-label="Editar tarefa">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="icon-btn icon-btn--danger btn-delete" aria-label="Excluir tarefa">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0l-1 13a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    `;

    // Eventos do card
    li.querySelector(".task-checkbox").addEventListener("click", () =>
      alternarConclusao(tarefa.id),
    );
    li.querySelector(".btn-edit").addEventListener("click", () =>
      abrirModalEdicao(tarefa),
    );
    li.querySelector(".btn-delete").addEventListener("click", () =>
      abrirModalConfirmacao(tarefa.id),
    );

    return li;
  }

  function renderizarDashboard() {
    const total = tarefas.length;
    const concluidas = tarefas.filter((t) => t.concluida).length;
    const pendentes = total - concluidas;
    const taxa = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    statTotal.textContent = total;
    statConcluidas.textContent = concluidas;
    statPendentes.textContent = pendentes;
    statTaxa.textContent = `${taxa}%`;

    // Atualiza o "fio" de progresso no topo da página
    progressThread.style.width = `${taxa}%`;
  }

  /* ------------------------------------------------------------------------ */
  /*  Ações: concluir / desmarcar                                              */
  /* ------------------------------------------------------------------------ */
  async function alternarConclusao(id) {
    // Atualização otimista: muda a UI antes da resposta do servidor, para
    // dar sensação de instantaneidade. Se der erro, revertemos.
    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa) return;

    tarefa.concluida = !tarefa.concluida;
    renderizarTudo();

    try {
      await alternarConclusaoAPI(id);
      mostrarToast(
        tarefa.concluida
          ? "Tarefa concluída!"
          : "Tarefa marcada como pendente.",
        "success",
      );
    } catch (erro) {
      // Reverte em caso de falha
      tarefa.concluida = !tarefa.concluida;
      renderizarTudo();
      mostrarToast(erro.message, "error");
    }
  }

  /* ------------------------------------------------------------------------ */
  /*  Modal de edição                                                          */
  /* ------------------------------------------------------------------------ */
  function abrirModalEdicao(tarefa) {
    idParaEditar = tarefa.id;
    editTitulo.value = tarefa.titulo;
    editDescricao.value = tarefa.descricao || "";
    editModalOverlay.hidden = false;
    editTitulo.focus();
  }

  function fecharModalEdicao() {
    editModalOverlay.hidden = true;
    idParaEditar = null;
  }

  btnCancelEdit.addEventListener("click", fecharModalEdicao);
  editModalOverlay.addEventListener("click", (evento) => {
    if (evento.target === editModalOverlay) fecharModalEdicao();
  });

  editForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (idParaEditar === null) return;

    const novoTitulo = editTitulo.value.trim();
    const novaDescricao = editDescricao.value.trim();

    if (!novoTitulo) {
      mostrarToast("O título não pode ficar vazio.", "error");
      return;
    }

    try {
      const tarefaAtualizada = await atualizarTarefa(
        idParaEditar,
        novoTitulo,
        novaDescricao,
      );
      const indice = tarefas.findIndex((t) => t.id === idParaEditar);
      if (indice !== -1) tarefas[indice] = tarefaAtualizada;

      renderizarTudo();
      fecharModalEdicao();
      mostrarToast("Tarefa atualizada com sucesso!", "success");
    } catch (erro) {
      mostrarToast(erro.message, "error");
    }
  });

  /* ------------------------------------------------------------------------ */
  /*  Modal de confirmação de exclusão                                         */
  /* ------------------------------------------------------------------------ */
  function abrirModalConfirmacao(id) {
    idParaExcluir = id;
    confirmModalOverlay.hidden = false;
  }

  function fecharModalConfirmacao() {
    confirmModalOverlay.hidden = true;
    idParaExcluir = null;
  }

  btnCancelDelete.addEventListener("click", fecharModalConfirmacao);
  confirmModalOverlay.addEventListener("click", (evento) => {
    if (evento.target === confirmModalOverlay) fecharModalConfirmacao();
  });

  btnConfirmDelete.addEventListener("click", async () => {
    if (idParaExcluir === null) return;
    const id = idParaExcluir;
    const elementoCard = taskList.querySelector(`[data-id="${id}"]`);

    fecharModalConfirmacao();

    try {
      // Animação de saída antes de remover do estado
      if (elementoCard) {
        elementoCard.classList.add("is-removing");
        await esperar(200);
      }

      await excluirTarefaAPI(id);
      tarefas = tarefas.filter((t) => t.id !== id);
      renderizarTudo();
      mostrarToast("Tarefa excluída.", "success");
    } catch (erro) {
      mostrarToast(erro.message, "error");
      renderizarTudo();
    }
  });

  /* ------------------------------------------------------------------------ */
  /*  Toasts (mensagens de feedback)                                           */
  /* ------------------------------------------------------------------------ */
  function mostrarToast(mensagem, tipo = "success") {
    const toast = document.createElement("div");
    toast.className = `toast${tipo === "error" ? " toast--error" : ""}`;

    const icone =
      tipo === "error"
        ? '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
        : '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    toast.innerHTML = `${icone}<span>${escapeHtml(mensagem)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("is-leaving");
      setTimeout(() => toast.remove(), 220);
    }, 3200);
  }

  /* ------------------------------------------------------------------------ */
  /*  Utilitários                                                              */
  /* ------------------------------------------------------------------------ */
  function formatarData(dataISO) {
    // Recebe "AAAA-MM-DD" e devolve "DD/MM/AAAA"
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function escapeHtml(texto) {
    // Evita injeção de HTML ao renderizar título/descrição digitados pelo usuário
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
  }

  function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();
