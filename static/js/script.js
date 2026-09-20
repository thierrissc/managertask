(() => {
  "use strict";

  let tarefas = [];
  let filtroStatus = "todas";
  let filtroCategoria = "todas";
  let filtroData = null;
  let termoBusca = "";
  let ordenacao = "recente";
  let idParaEditar = null;
  let idParaExcluir = null;
  let subtarefasCriacao = [];
  let subtarefasEdicao = [];

  const taskForm = document.getElementById("taskForm");
  const tituloInput = document.getElementById("titulo");
  const descricaoInput = document.getElementById("descricao");
  const prioridadeSelect = document.getElementById("prioridade");
  const categoriaSelect = document.getElementById("categoria");
  const dataVencimentoInput = document.getElementById("dataVencimento");
  const btnAiSuggest = document.getElementById("btnAiSuggest");
  const aiPreviewBox = document.getElementById("aiPreviewBox");
  const aiSubtasksList = document.getElementById("aiSubtasksList");
  const btnCloseAiPreview = document.getElementById("btnCloseAiPreview");

  const taskList = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");
  const emptyStateText = document.getElementById("emptyStateText");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");

  const statTotal = document.getElementById("statTotal");
  const statConcluidas = document.getElementById("statConcluidas");
  const statPendentes = document.getElementById("statPendentes");
  const statTaxa = document.getElementById("statTaxa");
  const statProgressBar = document.getElementById("statProgressBar");

  const headerDate = document.getElementById("headerDate");
  const dateTrigger = document.getElementById("dateTrigger");
  const calendarPopover = document.getElementById("calendarPopover");
  const calPrevMonth = document.getElementById("calPrevMonth");
  const calNextMonth = document.getElementById("calNextMonth");
  const calMonthLabel = document.getElementById("calMonthLabel");
  const calendarGrid = document.getElementById("calendarGrid");
  const calToday = document.getElementById("calToday");
  const calClear = document.getElementById("calClear");
  const dateFilterChip = document.getElementById("dateFilterChip");
  const dateFilterLabel = document.getElementById("dateFilterLabel");
  const btnClearDateChip = document.getElementById("btnClearDateChip");

  const editModalOverlay = document.getElementById("editModalOverlay");
  const editForm = document.getElementById("editForm");
  const editTitulo = document.getElementById("editTitulo");
  const editDescricao = document.getElementById("editDescricao");
  const editPrioridade = document.getElementById("editPrioridade");
  const editCategoria = document.getElementById("editCategoria");
  const editDataVencimento = document.getElementById("editDataVencimento");
  const btnCancelEdit = document.getElementById("btnCancelEdit");
  const btnCloseEditX = document.getElementById("btnCloseEditX");
  const modalSubtasksList = document.getElementById("modalSubtasksList");
  const inputNewSubtask = document.getElementById("inputNewSubtask");
  const btnAddSubtaskItem = document.getElementById("btnAddSubtaskItem");
  const btnModalAiBreakdown = document.getElementById("btnModalAiBreakdown");

  const confirmModalOverlay = document.getElementById("confirmModalOverlay");
  const btnCancelDelete = document.getElementById("btnCancelDelete");
  const btnConfirmDelete = document.getElementById("btnConfirmDelete");

  const shortcutsModalOverlay = document.getElementById("shortcutsModalOverlay");
  const btnOpenShortcuts = document.getElementById("btnOpenShortcuts");
  const btnCloseShortcuts = document.getElementById("btnCloseShortcuts");

  const btnExportTasks = document.getElementById("btnExportTasks");
  const btnClearCompleted = document.getElementById("btnClearCompleted");
  const toastContainer = document.getElementById("toastContainer");

  const hoje = new Date();
  let mesExibidoAno = hoje.getFullYear();
  let mesExibidoMes = hoje.getMonth();

  document.addEventListener("DOMContentLoaded", () => {
    editModalOverlay.hidden = true;
    confirmModalOverlay.hidden = true;
    shortcutsModalOverlay.hidden = true;
    atualizarHeaderDate();
    carregarTarefas();
    configurarEventos();
  });

  function tocarSomSucesso() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  function mostrarToast(mensagem, tipo = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast--${tipo}`;
    toast.textContent = mensagem;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("is-leaving");
      toast.addEventListener("animationend", () => toast.remove());
    }, 2800);
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatarDataISO(data) {
    return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
  }

  function converterISOParaData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }

  function atualizarHeaderDate() {
    const d = filtroData ? converterISOParaData(filtroData) : new Date();
    const texto = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    headerDate.textContent = texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  async function carregarTarefas() {
    try {
      const resp = await fetch("/api/tasks");
      if (!resp.ok) throw new Error();
      tarefas = await resp.json();
      renderizarTudo();
    } catch (err) {
      mostrarToast("Não foi possível carregar as tarefas.", "error");
    }
  }

  async function atualizarEstatisticas() {
    try {
      const resp = await fetch("/api/stats");
      if (!resp.ok) throw new Error();
      const stats = await resp.json();
      statTotal.textContent = stats.total;
      statConcluidas.textContent = stats.concluidas;
      statPendentes.textContent = stats.pendentes;
      statTaxa.textContent = `${stats.taxa_conclusao}%`;
      statProgressBar.style.width = `${stats.taxa_conclusao}%`;
    } catch (err) {}
  }

  function tarefasFiltradas() {
    let resultado = tarefas.slice();

    if (filtroStatus === "pendentes") {
      resultado = resultado.filter(t => !t.concluida);
    } else if (filtroStatus === "concluidas") {
      resultado = resultado.filter(t => t.concluida);
    }

    if (filtroCategoria !== "todas") {
      resultado = resultado.filter(t => (t.categoria || "geral").toLowerCase() === filtroCategoria);
    }

    if (filtroData) {
      resultado = resultado.filter(t => t.data_criacao === filtroData || t.data_vencimento === filtroData);
    }

    if (termoBusca.trim()) {
      const termo = termoBusca.toLowerCase().trim();
      resultado = resultado.filter(t => 
        (t.titulo || "").toLowerCase().includes(termo) ||
        (t.descricao || "").toLowerCase().includes(termo) ||
        (t.categoria || "").toLowerCase().includes(termo)
      );
    }

    if (ordenacao === "vencimento") {
      resultado.sort((a, b) => {
        if (!a.data_vencimento) return 1;
        if (!b.data_vencimento) return -1;
        return a.data_vencimento.localeCompare(b.data_vencimento);
      });
    } else if (ordenacao === "prioridade") {
      const peso = { alta: 3, media: 2, baixa: 1 };
      resultado.sort((a, b) => (peso[b.prioridade] || 2) - (peso[a.prioridade] || 2));
    } else if (ordenacao === "alfabetica") {
      resultado.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
    } else {
      resultado.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return resultado;
  }

  function renderizarTudo() {
    atualizarEstatisticas();
    renderizarLista();
    atualizarChipData();
    renderizarCalendario();
  }

  function formatarVencimentoLabel(dataStr) {
    if (!dataStr) return null;
    const hojeStr = formatarDataISO(new Date());
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const amanhaStr = formatarDataISO(amanha);

    if (dataStr < hojeStr) {
      return { texto: "Atrasada", classe: "is-overdue" };
    }
    if (dataStr === hojeStr) {
      return { texto: "Hoje", classe: "is-today" };
    }
    if (dataStr === amanhaStr) {
      return { texto: "Amanhã", classe: "" };
    }
    const [ano, mes, dia] = dataStr.split("-");
    return { texto: `${dia}/${mes}`, classe: "" };
  }

  function renderizarLista() {
    taskList.innerHTML = "";
    const lista = tarefasFiltradas();

    if (lista.length === 0) {
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;

    lista.forEach(tarefa => {
      const item = document.createElement("li");
      item.className = `task-item ${tarefa.concluida ? "is-done" : ""}`;
      item.dataset.id = tarefa.id;

      const mainRow = document.createElement("div");
      mainRow.className = "task-item-main";

      const chk = document.createElement("button");
      chk.type = "button";
      chk.className = `task-checkbox-custom ${tarefa.concluida ? "is-checked" : ""}`;
      chk.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>`;
      chk.addEventListener("click", () => toggleTarefa(tarefa.id));

      const content = document.createElement("div");
      content.className = "task-content";

      const headerRow = document.createElement("div");
      headerRow.className = "task-header-row";

      const prio = tarefa.prioridade || "media";
      const prioBadge = document.createElement("span");
      prioBadge.className = `badge-priority badge-priority--${prio}`;
      prioBadge.textContent = prio;
      headerRow.appendChild(prioBadge);

      if (tarefa.categoria) {
        const catBadge = document.createElement("span");
        catBadge.className = "badge-category";
        catBadge.textContent = tarefa.categoria;
        headerRow.appendChild(catBadge);
      }

      const dueInfo = formatarVencimentoLabel(tarefa.data_vencimento);
      if (dueInfo && !tarefa.concluida) {
        const dueBadge = document.createElement("span");
        dueBadge.className = `badge-due ${dueInfo.classe}`;
        dueBadge.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${dueInfo.texto}`;
        headerRow.appendChild(dueBadge);
      }

      const titleEl = document.createElement("h4");
      titleEl.className = "task-title";
      titleEl.textContent = tarefa.titulo;

      content.appendChild(headerRow);
      content.appendChild(titleEl);

      if (tarefa.descricao) {
        const descEl = document.createElement("p");
        descEl.className = "task-description";
        descEl.textContent = tarefa.descricao;
        content.appendChild(descEl);
      }

      const actions = document.createElement("div");
      actions.className = "task-item-actions";

      const btnEdit = document.createElement("button");
      btnEdit.type = "button";
      btnEdit.className = "icon-btn";
      btnEdit.title = "Editar tarefa";
      btnEdit.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
      btnEdit.addEventListener("click", () => abrirModalEdicao(tarefa));

      const btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "icon-btn icon-btn--danger";
      btnDel.title = "Excluir tarefa";
      btnDel.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
      btnDel.addEventListener("click", () => abrirModalConfirmacao(tarefa.id));

      actions.appendChild(btnEdit);
      actions.appendChild(btnDel);

      mainRow.appendChild(chk);
      mainRow.appendChild(content);
      mainRow.appendChild(actions);
      item.appendChild(mainRow);

      const subtasks = tarefa.subtarefas || [];
      if (subtasks.length > 0) {
        const collapseWrap = document.createElement("div");
        collapseWrap.className = "subtasks-collapse-wrap";

        const subDone = subtasks.filter(s => s.concluida).length;
        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = "subtasks-toggle-btn";
        toggleBtn.innerHTML = `<span>Checklist (${subDone}/${subtasks.length})</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;

        const subList = document.createElement("div");
        subList.className = "subtasks-items-list";

        subtasks.forEach(s => {
          const row = document.createElement("div");
          row.className = "subtask-single-row";

          const left = document.createElement("label");
          left.className = `subtask-single-left ${s.concluida ? "is-checked" : ""}`;

          const subChk = document.createElement("input");
          subChk.type = "checkbox";
          subChk.checked = s.concluida;
          subChk.addEventListener("change", () => toggleSubtarefa(tarefa.id, s.id));

          const textSpan = document.createElement("span");
          textSpan.textContent = s.titulo;

          left.appendChild(subChk);
          left.appendChild(textSpan);
          row.appendChild(left);
          subList.appendChild(row);
        });

        toggleBtn.addEventListener("click", () => {
          const expanded = toggleBtn.classList.toggle("is-expanded");
          subList.style.display = expanded ? "none" : "flex";
        });

        collapseWrap.appendChild(toggleBtn);
        collapseWrap.appendChild(subList);
        item.appendChild(collapseWrap);
      }

      taskList.appendChild(item);
    });
  }

  async function toggleTarefa(id) {
    try {
      const resp = await fetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
      if (!resp.ok) throw new Error();
      const updated = await resp.json();
      const idx = tarefas.findIndex(t => t.id === id);
      if (idx !== -1) {
        tarefas[idx] = updated;
        if (updated.concluida) {
          tocarSomSucesso();
        }
      }
      renderizarTudo();
    } catch (err) {
      mostrarToast("Erro ao alternar status.", "error");
    }
  }

  async function toggleSubtarefa(taskId, subId) {
    try {
      const resp = await fetch(`/api/tasks/${taskId}/subtasks/${subId}/toggle`, { method: "PATCH" });
      if (!resp.ok) throw new Error();
      const updated = await resp.json();
      const idx = tarefas.findIndex(t => t.id === taskId);
      if (idx !== -1) {
        tarefas[idx] = updated;
      }
      renderizarTudo();
    } catch (err) {
      mostrarToast("Erro ao atualizar subtarefa.", "error");
    }
  }

  async function criarTarefaSubmit(e) {
    e.preventDefault();
    const titulo = tituloInput.value.trim();
    if (!titulo) return;

    const payload = {
      titulo,
      descricao: descricaoInput.value.trim(),
      prioridade: prioridadeSelect.value,
      categoria: categoriaSelect.value,
      data_vencimento: dataVencimentoInput.value,
      subtarefas: subtarefasCriacao
    };

    try {
      const resp = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error();
      const nova = await resp.json();
      tarefas.unshift(nova);
      taskForm.reset();
      subtarefasCriacao = [];
      aiPreviewBox.hidden = true;
      renderizarTudo();
      mostrarToast("Tarefa adicionada com sucesso!", "success");
    } catch (err) {
      mostrarToast("Erro ao criar tarefa.", "error");
    }
  }

  async function quebrarComIA() {
    const tit = tituloInput.value.trim();
    if (!tit) {
      mostrarToast("Digite o título da tarefa para quebrar com IA.", "info");
      tituloInput.focus();
      return;
    }

    btnAiSuggest.disabled = true;
    btnAiSuggest.style.opacity = "0.6";
    mostrarToast("Assistente de IA analisando a tarefa...", "info");

    try {
      const resp = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: tit, descricao: descricaoInput.value.trim() })
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      const itens = data.subtarefas || [];

      if (itens.length === 0) {
        mostrarToast("Nenhuma subtarefa gerada.", "info");
        return;
      }

      subtarefasCriacao = itens.map(t => ({ titulo: t, concluida: false }));
      renderizarAiPreview();
      aiPreviewBox.hidden = false;
      mostrarToast(`${itens.length} subtarefas sugeridas!`, "success");
    } catch (err) {
      mostrarToast("Falha na consulta de IA.", "error");
    } finally {
      btnAiSuggest.disabled = false;
      btnAiSuggest.style.opacity = "1";
    }
  }

  function renderizarAiPreview() {
    aiSubtasksList.innerHTML = "";
    subtarefasCriacao.forEach((sub, i) => {
      const li = document.createElement("li");
      li.className = "ai-subtask-item";
      li.innerHTML = `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" checked data-index="${i}"> <span>${sub.titulo}</span></label>`;
      aiSubtasksList.appendChild(li);
    });

    aiSubtasksList.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("change", e => {
        const idx = Number(e.target.dataset.index);
        if (!e.target.checked) {
          subtarefasCriacao.splice(idx, 1);
          renderizarAiPreview();
        }
      });
    });
  }

  function abrirModalEdicao(tarefa) {
    idParaEditar = tarefa.id;
    editTitulo.value = tarefa.titulo;
    editDescricao.value = tarefa.descricao || "";
    editPrioridade.value = tarefa.prioridade || "media";
    editCategoria.value = tarefa.categoria || "geral";
    editDataVencimento.value = tarefa.data_vencimento || "";
    subtarefasEdicao = JSON.parse(JSON.stringify(tarefa.subtarefas || []));

    renderizarModalSubtasks();
    editModalOverlay.hidden = false;
    editTitulo.focus();
  }

  function fecharModalEdicao() {
    editModalOverlay.hidden = true;
    idParaEditar = null;
    subtarefasEdicao = [];
  }

  function renderizarModalSubtasks() {
    modalSubtasksList.innerHTML = "";
    subtarefasEdicao.forEach((s, idx) => {
      const li = document.createElement("li");
      li.className = "subtask-single-row";
      li.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" ${s.concluida ? "checked" : ""}>
          <span style="${s.concluida ? "text-decoration:line-through;opacity:0.6" : ""}">${s.titulo}</span>
        </div>
        <button type="button" class="btn-del-subtask">✕</button>
      `;
      li.querySelector("input").addEventListener("change", e => {
        s.concluida = e.target.checked;
        renderizarModalSubtasks();
      });
      li.querySelector(".btn-del-subtask").addEventListener("click", () => {
        subtarefasEdicao.splice(idx, 1);
        renderizarModalSubtasks();
      });
      modalSubtasksList.appendChild(li);
    });
  }

  async function salvarEdicaoSubmit(e) {
    e.preventDefault();
    if (!idParaEditar) return;
    const tit = editTitulo.value.trim();
    if (!tit) return;

    const payload = {
      titulo: tit,
      descricao: editDescricao.value.trim(),
      prioridade: editPrioridade.value,
      categoria: editCategoria.value,
      data_vencimento: editDataVencimento.value,
      subtarefas: subtarefasEdicao
    };

    try {
      const resp = await fetch(`/api/tasks/${idParaEditar}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error();
      const updated = await resp.json();
      const idx = tarefas.findIndex(t => t.id === idParaEditar);
      if (idx !== -1) tarefas[idx] = updated;
      fecharModalEdicao();
      renderizarTudo();
      mostrarToast("Tarefa atualizada!", "success");
    } catch (err) {
      mostrarToast("Erro ao atualizar tarefa.", "error");
    }
  }

  async function quebrarEdicaoComIA() {
    const tit = editTitulo.value.trim();
    if (!tit) return;
    btnModalAiBreakdown.disabled = true;
    mostrarToast("Gerando sugestões com IA...", "info");
    try {
      const resp = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: tit, descricao: editDescricao.value.trim() })
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      (data.subtarefas || []).forEach(subT => {
        subtarefasEdicao.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          titulo: subT,
          concluida: false
        });
      });
      renderizarModalSubtasks();
      mostrarToast("Subtarefas adicionadas!", "success");
    } catch (err) {
      mostrarToast("Erro ao chamar IA.", "error");
    } finally {
      btnModalAiBreakdown.disabled = false;
    }
  }

  function abrirModalConfirmacao(id) {
    idParaExcluir = id;
    confirmModalOverlay.hidden = false;
  }

  function fecharModalConfirmacao() {
    confirmModalOverlay.hidden = true;
    idParaExcluir = null;
  }

  async function confirmarExclusao() {
    if (!idParaExcluir) return;
    try {
      const resp = await fetch(`/api/tasks/${idParaExcluir}`, { method: "DELETE" });
      if (!resp.ok) throw new Error();
      tarefas = tarefas.filter(t => t.id !== idParaExcluir);
      fecharModalConfirmacao();
      renderizarTudo();
      mostrarToast("Tarefa excluída.", "info");
    } catch (err) {
      mostrarToast("Erro ao excluir tarefa.", "error");
    }
  }

  async function limparConcluidas() {
    if (!tarefas.some(t => t.concluida)) {
      mostrarToast("Não há tarefas concluídas para remover.", "info");
      return;
    }
    try {
      const resp = await fetch("/api/tasks/clear-completed", { method: "POST" });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      tarefas = tarefas.filter(t => !t.concluida);
      renderizarTudo();
      mostrarToast(data.mensagem || "Tarefas concluídas removidas.", "success");
    } catch (err) {
      mostrarToast("Erro ao limpar concluídas.", "error");
    }
  }

  function exportarTarefas() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tarefas, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `tarefas_backup_${formatarDataISO(new Date())}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    mostrarToast("Backup JSON exportado com sucesso!", "success");
  }

  function renderizarCalendario() {
    calendarGrid.innerHTML = "";
    const diasNoMes = new Date(mesExibidoAno, mesExibidoMes + 1, 0).getDate();
    const primeiroDiaSemana = new Date(mesExibidoAno, mesExibidoMes, 1).getDay();

    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    calMonthLabel.textContent = `${meses[mesExibidoMes]} ${mesExibidoAno}`;

    for (let i = 0; i < primeiroDiaSemana; i++) {
      const v = document.createElement("span");
      v.className = "cal-day is-empty";
      calendarGrid.appendChild(v);
    }

    const hojeStr = formatarDataISO(hoje);
    const datasComTarefas = new Set(tarefas.map(t => t.data_criacao).filter(Boolean));

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataBtn = new Date(mesExibidoAno, mesExibidoMes, dia);
      const dataISO = formatarDataISO(dataBtn);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.textContent = dia;

      if (dataISO === hojeStr) btn.classList.add("is-today");
      if (dataISO === filtroData) btn.classList.add("is-selected");
      if (datasComTarefas.has(dataISO)) btn.classList.add("has-tasks");

      btn.addEventListener("click", () => {
        filtroData = filtroData === dataISO ? null : dataISO;
        calendarPopover.hidden = true;
        dateTrigger.setAttribute("aria-expanded", "false");
        atualizarHeaderDate();
        renderizarTudo();
      });

      calendarGrid.appendChild(btn);
    }

    calClear.hidden = !filtroData;
  }

  function atualizarChipData() {
    if (filtroData) {
      dateFilterChip.hidden = false;
      const [ano, mes, dia] = filtroData.split("-");
      dateFilterLabel.textContent = `Filtrado: ${dia}/${mes}/${ano}`;
    } else {
      dateFilterChip.hidden = true;
    }
  }

  function configurarEventos() {
    taskForm.addEventListener("submit", criarTarefaSubmit);
    btnAiSuggest.addEventListener("click", quebrarComIA);
    btnCloseAiPreview.addEventListener("click", () => {
      aiPreviewBox.hidden = true;
      subtarefasCriacao = [];
    });

    searchInput.addEventListener("input", e => {
      termoBusca = e.target.value;
      renderizarLista();
    });

    sortSelect.addEventListener("change", e => {
      ordenacao = e.target.value;
      renderizarLista();
    });

    document.querySelectorAll(".filter-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        filtroStatus = tab.dataset.status;
        renderizarLista();
      });
    });

    document.querySelectorAll(".cat-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        filtroCategoria = chip.dataset.category;
        renderizarLista();
      });
    });

    btnClearCompleted.addEventListener("click", limparConcluidas);
    btnExportTasks.addEventListener("click", exportarTarefas);

    dateTrigger.addEventListener("click", () => {
      const open = calendarPopover.hidden;
      calendarPopover.hidden = !open;
      dateTrigger.setAttribute("aria-expanded", String(open));
    });

    calPrevMonth.addEventListener("click", () => {
      mesExibidoMes--;
      if (mesExibidoMes < 0) {
        mesExibidoMes = 11;
        mesExibidoAno--;
      }
      renderizarCalendario();
    });

    calNextMonth.addEventListener("click", () => {
      mesExibidoMes++;
      if (mesExibidoMes > 11) {
        mesExibidoMes = 0;
        mesExibidoAno++;
      }
      renderizarCalendario();
    });

    calToday.addEventListener("click", () => {
      filtroData = formatarDataISO(new Date());
      calendarPopover.hidden = true;
      dateTrigger.setAttribute("aria-expanded", "false");
      atualizarHeaderDate();
      renderizarTudo();
    });

    calClear.addEventListener("click", () => {
      filtroData = null;
      calendarPopover.hidden = true;
      dateTrigger.setAttribute("aria-expanded", "false");
      atualizarHeaderDate();
      renderizarTudo();
    });

    btnClearDateChip.addEventListener("click", () => {
      filtroData = null;
      atualizarHeaderDate();
      renderizarTudo();
    });

    editForm.addEventListener("submit", salvarEdicaoSubmit);
    btnCancelEdit.addEventListener("click", fecharModalEdicao);
    btnCloseEditX.addEventListener("click", fecharModalEdicao);

    btnAddSubtaskItem.addEventListener("click", () => {
      const val = inputNewSubtask.value.trim();
      if (!val) return;
      subtarefasEdicao.push({ id: Date.now(), titulo: val, concluida: false });
      inputNewSubtask.value = "";
      renderizarModalSubtasks();
    });

    btnModalAiBreakdown.addEventListener("click", quebrarEdicaoComIA);

    btnCancelDelete.addEventListener("click", fecharModalConfirmacao);
    btnConfirmDelete.addEventListener("click", confirmarExclusao);

    const btnInfoShortcuts = document.getElementById("btnInfoShortcuts");
    if (btnInfoShortcuts) {
      btnInfoShortcuts.addEventListener("click", () => {
        shortcutsModalOverlay.hidden = false;
      });
    }

    if (btnOpenShortcuts) {
      btnOpenShortcuts.addEventListener("click", () => {
        shortcutsModalOverlay.hidden = false;
      });
    }

    if (btnCloseShortcuts) {
      btnCloseShortcuts.addEventListener("click", () => {
        shortcutsModalOverlay.hidden = true;
      });
    }

    shortcutsModalOverlay.addEventListener("click", e => {
      if (e.target === shortcutsModalOverlay) {
        shortcutsModalOverlay.hidden = true;
      }
    });

    editModalOverlay.addEventListener("click", e => {
      if (e.target === editModalOverlay) {
        fecharModalEdicao();
      }
    });

    confirmModalOverlay.addEventListener("click", e => {
      if (e.target === confirmModalOverlay) {
        fecharModalConfirmacao();
      }
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        calendarPopover.hidden = true;
        dateTrigger.setAttribute("aria-expanded", "false");
        fecharModalEdicao();
        fecharModalConfirmacao();
        shortcutsModalOverlay.hidden = true;
      } else if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInput.focus();
      } else if ((e.key === "n" || e.key === "N") && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        tituloInput.focus();
      }
    });
  }
})();
