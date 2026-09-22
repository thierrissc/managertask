(() => {
  "use strict";

  let tarefas = [];
  let filtroStatus = "todas";
  let filtroRecorrencia = "todas";
  let filtroCategoria = "todas";
  let filtroData = null;
  let termoBusca = "";
  let ordenacao = "recente";
  let idParaEditar = null;
  let idParaExcluir = null;
  let subtarefasCriacao = [];
  let subtarefasEdicao = [];
  const openChecklistTaskIds = new Set();

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

  const createModalOverlay = document.getElementById("createModalOverlay");
  const createModalForm = document.getElementById("createModalForm");
  const createTitulo = document.getElementById("createTitulo");
  const createDescricao = document.getElementById("createDescricao");
  const createPrioridade = document.getElementById("createPrioridade");
  const createRecorrencia = document.getElementById("createRecorrencia");
  const createDataVencimento = document.getElementById("createDataVencimento");
  const btnCancelCreate = document.getElementById("btnCancelCreate");
  const btnCloseCreateX = document.getElementById("btnCloseCreateX");
  const createSubtasksList = document.getElementById("createSubtasksList");
  const inputNewCreateSubtask = document.getElementById("inputNewCreateSubtask");
  const btnAddCreateSubtaskItem = document.getElementById("btnAddCreateSubtaskItem");
  const btnCreateAiBreakdown = document.getElementById("btnCreateAiBreakdown");

  const editModalOverlay = document.getElementById("editModalOverlay");
  const editForm = document.getElementById("editForm");
  const editTitulo = document.getElementById("editTitulo");
  const editDescricao = document.getElementById("editDescricao");
  const editPrioridade = document.getElementById("editPrioridade");
  const editRecorrencia = document.getElementById("editRecorrencia");
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

  const noteModalOverlay = document.getElementById("noteModalOverlay");
  const noteModalTaskTitle = document.getElementById("noteModalTaskTitle");
  const noteModalText = document.getElementById("noteModalText");
  const btnCloseNoteModalX = document.getElementById("btnCloseNoteModalX");
  const btnCloseNoteModal = document.getElementById("btnCloseNoteModal");
  const btnEditFromNoteModal = document.getElementById("btnEditFromNoteModal");
  let idParaVerNota = null;

  const aiSuggestModalOverlay = document.getElementById("aiSuggestModalOverlay");
  const aiSuggestionsContainer = document.getElementById("aiSuggestionsContainer");
  const btnCloseAiSuggestModalX = document.getElementById("btnCloseAiSuggestModalX");
  const btnCloseAiSuggestModal = document.getElementById("btnCloseAiSuggestModal");

  const shortcutsModalOverlay = document.getElementById("shortcutsModalOverlay");
  const btnOpenShortcuts = document.getElementById("btnOpenShortcuts");
  const btnCloseShortcuts = document.getElementById("btnCloseShortcuts");

  const btnExportTasks = document.getElementById("btnExportTasks");
  const btnImportTasks = document.getElementById("btnImportTasks");
  const importFileInput = document.getElementById("importFileInput");
  const btnClearCompleted = document.getElementById("btnClearCompleted");
  const toastContainer = document.getElementById("toastContainer");

  const hoje = new Date();
  let mesExibidoAno = hoje.getFullYear();
  let mesExibidoMes = hoje.getMonth();

  function initThreeBackground() {
    const canvas = document.getElementById("threeCanvas");
    if (!canvas || typeof THREE === "undefined") return;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 14, 28);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const rows = 35;
      const cols = 60;
      const count = rows * cols;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      const color1 = new THREE.Color("#6366f1");
      const color2 = new THREE.Color("#ec4899");

      let idx = 0;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = (j - cols / 2) * 1.4;
          const y = (i - rows / 2) * 1.3;
          positions[idx * 3] = x;
          positions[idx * 3 + 1] = 0;
          positions[idx * 3 + 2] = y;

          const ratio = (i / rows + j / cols) * 0.5;
          const c = color1.clone().lerp(color2, ratio);
          colors[idx * 3] = c.r;
          colors[idx * 3 + 1] = c.g;
          colors[idx * 3 + 2] = c.b;
          idx++;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 1.7,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      let mouseX = 0;
      let mouseY = 0;
      window.addEventListener("mousemove", e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 3;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 3;
      });

      const clock = new THREE.Clock();
      function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime() * 0.7;
        const pos = geometry.attributes.position.array;

        let pIdx = 0;
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            const x = pos[pIdx * 3];
            const z = pos[pIdx * 3 + 2];
            pos[pIdx * 3 + 1] = Math.sin(x * 0.16 + t) * 1.6 + Math.cos(z * 0.18 + t * 1.1) * 1.4;
            pIdx++;
          }
        }
        geometry.attributes.position.needsUpdate = true;

        camera.position.x += (mouseX - camera.position.x) * 0.03;
        camera.position.y += (14 - mouseY - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", () => {
    editModalOverlay.hidden = true;
    confirmModalOverlay.hidden = true;
    shortcutsModalOverlay.hidden = true;
    if (noteModalOverlay) noteModalOverlay.hidden = true;
    if (aiSuggestModalOverlay) aiSuggestModalOverlay.hidden = true;
    restaurarFiltrosSalvos();
    atualizarHeaderDate();
    carregarTarefas();
    configurarEventos();
    initThreeBackground();
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
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast toast--${tipo}`;
    toast.textContent = mensagem;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("is-leaving");
      setTimeout(() => {
        toast.remove();
      }, 300);
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

  function restaurarFiltrosSalvos() {
    try {
      const s = localStorage.getItem("managertask_status");
      if (s && ["todas", "pendentes", "concluidas"].includes(s)) {
        filtroStatus = s;
        const statusFilterMenu = document.getElementById("statusFilterMenu");
        const statusFilterLabel = document.getElementById("statusFilterLabel");
        if (statusFilterMenu) {
          const item = statusFilterMenu.querySelector(`[data-status="${s}"]`);
          if (item) {
            statusFilterMenu.querySelectorAll(".dropdown-item").forEach(el => {
              el.classList.remove("is-selected");
              const chk = el.querySelector(".dropdown-check");
              if (chk) chk.textContent = "";
            });
            item.classList.add("is-selected");
            const chk = item.querySelector(".dropdown-check");
            if (chk) chk.textContent = "✓";
            const labels = { todas: "Status: Todas", pendentes: "Status: Pendentes", concluidas: "Status: Concluídas" };
            if (statusFilterLabel) statusFilterLabel.textContent = labels[s] || "Status";
          }
        }
      }

      const r = localStorage.getItem("managertask_rec");
      if (r && ["todas", "diaria", "semanal", "mensal", "anual", "unica"].includes(r)) {
        filtroRecorrencia = r;
        const recFilterMenu = document.getElementById("recFilterMenu");
        const recFilterLabel = document.getElementById("recFilterLabel");
        if (recFilterMenu) {
          const item = recFilterMenu.querySelector(`[data-rec="${r}"]`);
          if (item) {
            recFilterMenu.querySelectorAll(".dropdown-item").forEach(el => {
              el.classList.remove("is-selected");
              const chk = el.querySelector(".dropdown-check");
              if (chk) chk.textContent = "";
            });
            item.classList.add("is-selected");
            const chk = item.querySelector(".dropdown-check");
            if (chk) chk.textContent = "✓";
            const recLabels = { todas: "Repetição: Todas", diaria: "Repetição: Diárias", semanal: "Repetição: Semanais", mensal: "Repetição: Mensais", anual: "Repetição: Anuais", unica: "Repetição: Única vez" };
            if (recFilterLabel) recFilterLabel.textContent = recLabels[r] || "Repetição";
          }
        }
      }

      const o = localStorage.getItem("managertask_sort");
      if (o && ["recente", "prioridade", "recorrencia", "vencimento", "alfabetica", "antiga"].includes(o)) {
        ordenacao = o;
        const sortFilterMenu = document.getElementById("sortFilterMenu");
        const sortFilterLabel = document.getElementById("sortFilterLabel");
        if (sortFilterMenu) {
          const item = sortFilterMenu.querySelector(`[data-sort="${o}"]`);
          if (item) {
            sortFilterMenu.querySelectorAll(".dropdown-item").forEach(el => {
              el.classList.remove("is-selected");
              const chk = el.querySelector(".dropdown-check");
              if (chk) chk.textContent = "";
            });
            item.classList.add("is-selected");
            const chk = item.querySelector(".dropdown-check");
            if (chk) chk.textContent = "✓";
            const labels = { recente: "Ordenar: Recentes", prioridade: "Ordenar: Prioridade", recorrencia: "Ordenar: Repetição", vencimento: "Ordenar: Prazo", alfabetica: "Ordenar: A-Z", antiga: "Ordenar: Antigas" };
            if (sortFilterLabel) sortFilterLabel.textContent = labels[o] || "Ordenar";
          }
        }
      }

      const c = localStorage.getItem("managertask_cat");
      if (c) {
        filtroCategoria = c;
        document.querySelectorAll(".cat-chip").forEach(chip => {
          chip.classList.toggle("is-active", chip.dataset.category === c);
        });
      }
    } catch (e) {}
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

    if (filtroRecorrencia !== "todas") {
      resultado = resultado.filter(t => (t.recorrencia || "unica").toLowerCase() === filtroRecorrencia);
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
    } else if (ordenacao === "recorrencia") {
      const pesoRec = { diaria: 5, semanal: 4, mensal: 3, anual: 2, unica: 1 };
      resultado.sort((a, b) => (pesoRec[b.recorrencia || "unica"] || 1) - (pesoRec[a.recorrencia || "unica"] || 1));
    } else if (ordenacao === "alfabetica") {
      resultado.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
    } else if (ordenacao === "antiga") {
      resultado.sort((a, b) => (a.id || 0) - (b.id || 0));
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
      const prio = tarefa.prioridade || "media";
      const item = document.createElement("li");
      item.className = `task-item prio-${prio} ${tarefa.concluida ? "is-done" : ""}`;
      item.dataset.id = tarefa.id;

      const mainRow = document.createElement("div");
      mainRow.className = "task-item-main";

      const chk = document.createElement("button");
      chk.type = "button";
      chk.className = `task-checkbox-custom ${tarefa.concluida ? "is-checked" : ""}`;
      chk.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>`;
      chk.addEventListener("click", () => toggleTarefa(tarefa.id));

      const prioDot = document.createElement("span");
      prioDot.className = `task-prio-dot task-prio-dot--${prio}`;
      prioDot.title = `Prioridade ${prio}`;

      const content = document.createElement("div");
      content.className = "task-content";

      const dueInfo = formatarVencimentoLabel(tarefa.data_vencimento);

      if (tarefa.descricao) {
        item.classList.add("has-desc");
      }

      const titleRow = document.createElement("div");
      titleRow.className = "task-title-row";

      const titleEl = document.createElement("h4");
      titleEl.className = "task-title";
      titleEl.textContent = tarefa.titulo;
      titleRow.appendChild(titleEl);

      const recLabels = {
        diaria: "Diária",
        semanal: "Semanal",
        mensal: "Mensal",
        anual: "Anual"
      };
      if (tarefa.recorrencia && recLabels[tarefa.recorrencia]) {
        const recBadge = document.createElement("span");
        recBadge.className = "task-rec-badge";
        recBadge.title = `Repetição: ${recLabels[tarefa.recorrencia]}`;
        recBadge.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          <span>${recLabels[tarefa.recorrencia]}</span>
        `;
        titleRow.appendChild(recBadge);
      }

      if (dueInfo && !tarefa.concluida) {
        const dueBadge = document.createElement("span");
        dueBadge.className = `task-due-badge ${dueInfo.classe}`;
        dueBadge.textContent = dueInfo.texto;
        titleRow.appendChild(dueBadge);
      }

      if (tarefa.descricao) {
        const noteBtn = document.createElement("button");
        noteBtn.type = "button";
        noteBtn.className = "task-note-btn";
        noteBtn.title = "Abrir anotação da tarefa";
        noteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg><span>Nota</span>`;
        noteBtn.addEventListener("click", e => {
          e.stopPropagation();
          abrirModalNota(tarefa);
        });
        titleRow.appendChild(noteBtn);
      }

      content.appendChild(titleRow);

      if (tarefa.descricao) {
        content.style.cursor = "pointer";
        content.addEventListener("click", () => {
          abrirModalNota(tarefa);
        });
      }

      const subtasks = tarefa.subtarefas || [];
      if (subtasks.length > 0) {
        const subDone = subtasks.filter(s => s.concluida).length;
        const allDone = subDone === subtasks.length;
        const isChecklistOpen = openChecklistTaskIds.has(tarefa.id);

        const checkSection = document.createElement("div");
        checkSection.className = "task-checklist-section";

        const toggleBtn = document.createElement("button");
        toggleBtn.type = "button";
        toggleBtn.className = `task-checklist-toggle ${allDone ? "is-completed" : ""} ${isChecklistOpen ? "is-expanded" : ""}`;
        toggleBtn.title = "Clique para abrir/fechar o checklist";
        toggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>Checklist (${subDone}/${subtasks.length})</span>
          <svg class="checklist-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        `;

        const collapseWrap = document.createElement("div");
        collapseWrap.className = `subtasks-collapse-wrap ${isChecklistOpen ? "is-open" : ""}`;
        collapseWrap.addEventListener("click", e => e.stopPropagation());

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
          subChk.addEventListener("change", (e) => {
            e.stopPropagation();
            toggleSubtarefa(tarefa.id, s.id);
          });

          const textSpan = document.createElement("span");
          textSpan.textContent = s.titulo;

          left.appendChild(subChk);
          left.appendChild(textSpan);
          row.appendChild(left);
          subList.appendChild(row);
        });

        collapseWrap.appendChild(subList);

        toggleBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (openChecklistTaskIds.has(tarefa.id)) {
            openChecklistTaskIds.delete(tarefa.id);
            collapseWrap.classList.remove("is-open");
            toggleBtn.classList.remove("is-expanded");
          } else {
            openChecklistTaskIds.add(tarefa.id);
            collapseWrap.classList.add("is-open");
            toggleBtn.classList.add("is-expanded");
          }
        });

        checkSection.appendChild(toggleBtn);
        checkSection.appendChild(collapseWrap);
        content.appendChild(checkSection);
      }

      const actions = document.createElement("div");
      actions.className = "task-item-actions";

      const btnEdit = document.createElement("button");
      btnEdit.type = "button";
      btnEdit.className = "icon-btn";
      btnEdit.title = "Editar tarefa";
      btnEdit.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
      btnEdit.addEventListener("click", e => {
        e.stopPropagation();
        abrirModalEdicao(tarefa);
      });

      const btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "icon-btn icon-btn--danger";
      btnDel.title = "Excluir tarefa";
      btnDel.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
      btnDel.addEventListener("click", e => {
        e.stopPropagation();
        abrirModalConfirmacao(tarefa.id);
      });

      actions.appendChild(btnEdit);
      actions.appendChild(btnDel);

      mainRow.appendChild(chk);
      mainRow.appendChild(prioDot);
      mainRow.appendChild(content);
      mainRow.appendChild(actions);
      item.appendChild(mainRow);

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

  function abrirCriacaoPopupOuValidar(e) {
    if (e) e.preventDefault();
    const titulo = tituloInput.value.trim();
    if (!titulo) {
      tituloInput.classList.add("input-invalid");
      setTimeout(() => tituloInput.classList.remove("input-invalid"), 600);
      mostrarToast("Por favor, preencha o que você precisa fazer.", "error");
      tituloInput.focus();
      return;
    }
    abrirModalCriacao(titulo);
  }

  function abrirModalCriacao(tituloInicial = "", descricaoInicial = "", prioridadeInicial = "media", recorrenciaInicial = "unica", subtarefasIniciais = []) {
    if (createTitulo) createTitulo.value = tituloInicial;
    if (createDescricao) createDescricao.value = descricaoInicial;
    if (createPrioridade) createPrioridade.value = prioridadeInicial;
    if (createRecorrencia) createRecorrencia.value = recorrenciaInicial;
    if (createDataVencimento) createDataVencimento.value = "";
    if (Array.isArray(subtarefasIniciais) && subtarefasIniciais.length > 0) {
      subtarefasCriacao = subtarefasIniciais.map(item => {
        if (typeof item === "string") {
          return { id: Date.now() + Math.floor(Math.random() * 1000), titulo: item, concluida: false };
        }
        return item;
      });
    } else {
      subtarefasCriacao = [];
    }
    renderizarCreateSubtasks();
    if (createModalOverlay) {
      createModalOverlay.hidden = false;
      if (createTitulo) createTitulo.focus();
    }
  }

  function fecharModalCriacao() {
    if (createModalOverlay) createModalOverlay.hidden = true;
    subtarefasCriacao = [];
  }

  function renderizarCreateSubtasks() {
    if (!createSubtasksList) return;
    createSubtasksList.innerHTML = "";
    subtarefasCriacao.forEach((s, idx) => {
      const li = document.createElement("li");
      li.className = "subtask-single-row";
      li.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" ${s.concluida ? "checked" : ""}>
          <span style="${s.concluida ? "text-decoration:line-through;opacity:0.6" : ""}">${s.titulo}</span>
        </div>
        <button type="button" class="btn-del-subtask" aria-label="Remover subtarefa">✕</button>
      `;
      li.querySelector("input").addEventListener("change", e => {
        s.concluida = e.target.checked;
        renderizarCreateSubtasks();
      });
      li.querySelector(".btn-del-subtask").addEventListener("click", () => {
        subtarefasCriacao.splice(idx, 1);
        renderizarCreateSubtasks();
      });
      createSubtasksList.appendChild(li);
    });
  }

  async function salvarCriacaoModalSubmit(e) {
    if (e) e.preventDefault();
    const tit = createTitulo ? createTitulo.value.trim() : "";
    if (!tit) {
      if (createTitulo) {
        createTitulo.classList.add("input-invalid");
        setTimeout(() => createTitulo.classList.remove("input-invalid"), 600);
        createTitulo.focus();
      }
      mostrarToast("Por favor, preencha o título da tarefa.", "error");
      return;
    }

    const payload = {
      titulo: tit,
      descricao: createDescricao ? createDescricao.value.trim() : "",
      prioridade: createPrioridade ? createPrioridade.value : "media",
      recorrencia: createRecorrencia ? createRecorrencia.value : "unica",
      categoria: "geral",
      data_vencimento: createDataVencimento ? createDataVencimento.value : "",
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
      fecharModalCriacao();
      if (taskForm) taskForm.reset();
      renderizarTudo();
      mostrarToast("Tarefa adicionada com sucesso!", "success");
    } catch (err) {
      mostrarToast("Erro ao criar tarefa.", "error");
    }
  }

  async function quebrarCriacaoModalComIA() {
    const tit = createTitulo ? createTitulo.value.trim() : "";
    if (!tit) {
      if (createTitulo) {
        createTitulo.classList.add("input-invalid");
        setTimeout(() => createTitulo.classList.remove("input-invalid"), 600);
        createTitulo.focus();
      }
      mostrarToast("Por favor, informe o título para a IA sugerir etapas.", "info");
      return;
    }

    if (btnCreateAiBreakdown) btnCreateAiBreakdown.disabled = true;
    mostrarToast("Assistente de IA analisando a tarefa...", "info");

    try {
      const resp = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: tit,
          descricao: createDescricao ? createDescricao.value.trim() : ""
        })
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      (data.subtarefas || []).forEach(subT => {
        subtarefasCriacao.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          titulo: subT,
          concluida: false
        });
      });
      renderizarCreateSubtasks();
      mostrarToast("Checklist atualizado com sugestões da IA!", "success");
    } catch (err) {
      mostrarToast("Falha na consulta de IA.", "error");
    } finally {
      if (btnCreateAiBreakdown) btnCreateAiBreakdown.disabled = false;
    }
  }

  async function quebrarComIA() {
    const tit = tituloInput.value.trim();
    if (!tit) {
      sugerirAtividadesComIA();
      return;
    }

    btnAiSuggest.disabled = true;
    btnAiSuggest.style.opacity = "0.6";
    mostrarToast("Assistente de IA analisando a tarefa...", "info");

    try {
      const resp = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: tit, descricao: "" })
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      const itens = data.subtarefas || [];

      subtarefasCriacao = itens.map(t => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        titulo: t,
        concluida: false
      }));

      abrirModalCriacao(tit);
      mostrarToast(`${itens.length} subtarefas sugeridas pela IA!`, "success");
    } catch (err) {
      mostrarToast("Falha na consulta de IA.", "error");
    } finally {
      btnAiSuggest.disabled = false;
      btnAiSuggest.style.opacity = "1";
    }
  }

  function abrirModalSugestoesIA() {
    if (aiSuggestModalOverlay) aiSuggestModalOverlay.hidden = false;
  }

  function fecharModalSugestoesIA() {
    if (aiSuggestModalOverlay) aiSuggestModalOverlay.hidden = true;
  }

  async function sugerirAtividadesComIA() {
    abrirModalSugestoesIA();
    if (aiSuggestionsContainer) {
      aiSuggestionsContainer.innerHTML = `
        <div class="ai-loading-state">
          <div class="ai-loading-spinner"></div>
          <p>Analisando seu histórico de tarefas para sugerir as próximas atividades...</p>
        </div>
      `;
    }

    try {
      const resp = await fetch("/api/ai/suggest-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      const sugestoes = data.sugestoes || [];
      renderizarSugestoesIA(sugestoes);
    } catch (err) {
      if (aiSuggestionsContainer) {
        aiSuggestionsContainer.innerHTML = `
          <div class="ai-loading-state">
            <p style="color:var(--priority-high);">Não foi possível obter sugestões da IA no momento.</p>
            <button type="button" class="btn-secondary" id="btnRetryAiSuggest" style="margin-top:8px;">Tentar novamente</button>
          </div>
        `;
        const btnRetry = document.getElementById("btnRetryAiSuggest");
        if (btnRetry) btnRetry.addEventListener("click", sugerirAtividadesComIA);
      }
      mostrarToast("Erro ao carregar sugestões da IA.", "error");
    }
  }

  function renderizarSugestoesIA(sugestoes) {
    if (!aiSuggestionsContainer) return;
    if (!sugestoes || sugestoes.length === 0) {
      aiSuggestionsContainer.innerHTML = `
        <div class="ai-loading-state">
          <p>Nenhuma sugestão disponível no momento.</p>
        </div>
      `;
      return;
    }

    aiSuggestionsContainer.innerHTML = "";
    sugestoes.forEach(sug => {
      const card = document.createElement("div");
      card.className = "ai-suggestion-card";

      const badgePriClass = sug.prioridade === "alta" ? "ai-card-badge--alta" : (sug.prioridade === "baixa" ? "ai-card-badge--baixa" : "ai-card-badge--media");
      const priLabel = sug.prioridade ? (sug.prioridade.charAt(0).toUpperCase() + sug.prioridade.slice(1)) : "Média";
      const recLabel = sug.recorrencia ? (sug.recorrencia.charAt(0).toUpperCase() + sug.recorrencia.slice(1)) : "Única";

      let subtasksHtml = "";
      if (Array.isArray(sug.subtarefas) && sug.subtarefas.length > 0) {
        subtasksHtml = `
          <div class="ai-card-subtasks">
            ${sug.subtarefas.map(sub => `
              <div class="ai-card-subtask-item">
                <span class="ai-card-subtask-bullet">✦</span>
                <span>${typeof sub === "string" ? sub : (sub.titulo || "")}</span>
              </div>
            `).join("")}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="ai-card-header">
          <div class="ai-card-title">${sug.titulo}</div>
          <div class="ai-card-meta">
            <span class="ai-card-badge ${badgePriClass}">${priLabel}</span>
            <span class="ai-card-badge ai-card-badge--rec">${recLabel}</span>
          </div>
        </div>
        ${sug.descricao ? `<div class="ai-card-desc">${sug.descricao}</div>` : ""}
        ${subtasksHtml}
        <div class="ai-card-actions">
          <button type="button" class="ai-btn-edit">Personalizar</button>
          <button type="button" class="ai-btn-add">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Adicionar
          </button>
        </div>
      `;

      const btnAdd = card.querySelector(".ai-btn-add");
      btnAdd.addEventListener("click", async () => {
        btnAdd.disabled = true;
        btnAdd.textContent = "Adicionando...";
        await criarTarefaDireto(sug);
        fecharModalSugestoesIA();
      });

      const btnEdit = card.querySelector(".ai-btn-edit");
      btnEdit.addEventListener("click", () => {
        fecharModalSugestoesIA();
        abrirModalCriacao(sug.titulo, sug.descricao, sug.prioridade, sug.recorrencia, sug.subtarefas);
      });

      aiSuggestionsContainer.appendChild(card);
    });
  }

  async function criarTarefaDireto(sug) {
    const subtarefasFormatadas = (sug.subtarefas || []).map(st => ({
      id: Date.now() + Math.floor(Math.random() * 1000),
      titulo: typeof st === "string" ? st : (st.titulo || ""),
      concluida: false
    }));

    const payload = {
      titulo: sug.titulo,
      descricao: sug.descricao || "",
      prioridade: sug.prioridade || "media",
      recorrencia: sug.recorrencia || "unica",
      categoria: "geral",
      data_vencimento: "",
      subtarefas: subtarefasFormatadas
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
      renderizarTudo();
      mostrarToast(`Tarefa "${sug.titulo}" adicionada com sucesso!`, "success");
    } catch (err) {
      mostrarToast("Erro ao adicionar tarefa sugerida.", "error");
    }
  }

  function abrirModalEdicao(tarefa) {
    idParaEditar = tarefa.id;
    if (editTitulo) editTitulo.value = tarefa.titulo || "";
    if (editDescricao) editDescricao.value = tarefa.descricao || "";
    if (editPrioridade) editPrioridade.value = tarefa.prioridade || "media";
    if (editRecorrencia) editRecorrencia.value = tarefa.recorrencia || "unica";
    if (editDataVencimento) editDataVencimento.value = tarefa.data_vencimento || "";
    subtarefasEdicao = JSON.parse(JSON.stringify(tarefa.subtarefas || []));

    renderizarModalSubtasks();
    editModalOverlay.hidden = false;
    if (editTitulo) editTitulo.focus();
  }

  function fecharModalEdicao() {
    editModalOverlay.hidden = true;
    idParaEditar = null;
    subtarefasEdicao = [];
  }

  function abrirModalNota(tarefa) {
    idParaVerNota = tarefa.id;
    if (noteModalTaskTitle) noteModalTaskTitle.textContent = tarefa.titulo || "Sem título";
    if (noteModalText) noteModalText.textContent = tarefa.descricao || "Nenhuma anotação adicionada.";
    if (noteModalOverlay) noteModalOverlay.hidden = false;
  }

  function fecharModalNota() {
    if (noteModalOverlay) noteModalOverlay.hidden = true;
    idParaVerNota = null;
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
    const tit = editTitulo ? editTitulo.value.trim() : "";
    if (!tit) {
      if (editTitulo) {
        editTitulo.classList.add("input-invalid");
        setTimeout(() => editTitulo.classList.remove("input-invalid"), 600);
        editTitulo.focus();
      }
      mostrarToast("Por favor, preencha o título da tarefa.", "error");
      return;
    }

    const payload = {
      titulo: tit,
      descricao: editDescricao ? editDescricao.value.trim() : "",
      prioridade: editPrioridade ? editPrioridade.value : "media",
      recorrencia: editRecorrencia ? editRecorrencia.value : "unica",
      categoria: "geral",
      data_vencimento: editDataVencimento ? editDataVencimento.value : "",
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

  async function importarTarefasArquivo(file) {
    if (!file) return;

    if (!file.name.endsWith(".json") && file.type !== "application/json" && file.type !== "") {
      mostrarToast("Selecione um arquivo de backup em formato .json", "error");
      return;
    }

    try {
      const text = await file.text();
      let dados;
      try {
        dados = JSON.parse(text);
      } catch (e) {
        mostrarToast("O arquivo selecionado não contém um JSON válido.", "error");
        return;
      }

      mostrarToast("Restaurando backup...", "info");

      const resp = await fetch("/api/tasks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.erro || "Falha ao importar backup.");
      }

      const data = await resp.json();
      tarefas = data.tarefas || [];
      if (shortcutsModalOverlay) {
        shortcutsModalOverlay.hidden = true;
      }
      if (importFileInput) {
        importFileInput.value = "";
      }
      renderizarTudo();
      mostrarToast(data.mensagem || "Backup restaurado com sucesso!", "success");
    } catch (err) {
      mostrarToast(err.message || "Erro ao importar backup.", "error");
    }
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
    taskForm.addEventListener("submit", abrirCriacaoPopupOuValidar);
    btnAiSuggest.addEventListener("click", quebrarComIA);
    if (btnCloseAiPreview && aiPreviewBox) {
      btnCloseAiPreview.addEventListener("click", () => {
        aiPreviewBox.hidden = true;
        subtarefasCriacao = [];
      });
    }

    if (createModalForm) {
      createModalForm.addEventListener("submit", salvarCriacaoModalSubmit);
    }
    if (btnCancelCreate) {
      btnCancelCreate.addEventListener("click", fecharModalCriacao);
    }
    if (btnCloseCreateX) {
      btnCloseCreateX.addEventListener("click", fecharModalCriacao);
    }
    if (btnAddCreateSubtaskItem && inputNewCreateSubtask) {
      const addCreateItem = () => {
        const val = inputNewCreateSubtask.value.trim();
        if (!val) return;
        subtarefasCriacao.push({ id: Date.now(), titulo: val, concluida: false });
        inputNewCreateSubtask.value = "";
        renderizarCreateSubtasks();
      };
      btnAddCreateSubtaskItem.addEventListener("click", addCreateItem);
      inputNewCreateSubtask.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          addCreateItem();
        }
      });
    }
    if (btnCreateAiBreakdown) {
      btnCreateAiBreakdown.addEventListener("click", quebrarCriacaoModalComIA);
    }
    if (createModalOverlay) {
      createModalOverlay.addEventListener("click", e => {
        if (e.target === createModalOverlay) fecharModalCriacao();
      });
    }

    const btnToggleDesc = document.getElementById("btnToggleDesc");
    const creatorDescWrap = document.getElementById("creatorDescWrap");
    if (btnToggleDesc && creatorDescWrap) {
      btnToggleDesc.addEventListener("click", () => {
        const isHidden = creatorDescWrap.hidden;
        creatorDescWrap.hidden = !isHidden;
        btnToggleDesc.classList.toggle("is-active", isHidden);
        if (isHidden) {
          const inp = creatorDescWrap.querySelector("input");
          if (inp) inp.focus();
        }
      });
    }

    searchInput.addEventListener("input", e => {
      termoBusca = e.target.value;
      renderizarLista();
    });

    const btnStatusFilter = document.getElementById("btnStatusFilter");
    const statusFilterMenu = document.getElementById("statusFilterMenu");
    const statusFilterLabel = document.getElementById("statusFilterLabel");

    const btnRecFilter = document.getElementById("btnRecFilter");
    const recFilterMenu = document.getElementById("recFilterMenu");
    const recFilterLabel = document.getElementById("recFilterLabel");

    const btnSortFilter = document.getElementById("btnSortFilter");
    const sortFilterMenu = document.getElementById("sortFilterMenu");
    const sortFilterLabel = document.getElementById("sortFilterLabel");

    if (btnStatusFilter && statusFilterMenu) {
      btnStatusFilter.addEventListener("click", e => {
        e.stopPropagation();
        const isOpen = !statusFilterMenu.hidden;
        statusFilterMenu.hidden = isOpen;
        btnStatusFilter.setAttribute("aria-expanded", String(!isOpen));
        if (recFilterMenu) {
          recFilterMenu.hidden = true;
          if (btnRecFilter) btnRecFilter.setAttribute("aria-expanded", "false");
        }
        if (sortFilterMenu) {
          sortFilterMenu.hidden = true;
          if (btnSortFilter) btnSortFilter.setAttribute("aria-expanded", "false");
        }
      });

      statusFilterMenu.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click", () => {
          filtroStatus = item.dataset.status;
          try { localStorage.setItem("managertask_status", filtroStatus); } catch (e) {}
          statusFilterMenu.querySelectorAll(".dropdown-item").forEach(el => {
            el.classList.remove("is-selected");
            const chk = el.querySelector(".dropdown-check");
            if (chk) chk.textContent = "";
          });
          item.classList.add("is-selected");
          const chk = item.querySelector(".dropdown-check");
          if (chk) chk.textContent = "✓";

          const labels = {
            todas: "Status: Todas",
            pendentes: "Status: Pendentes",
            concluidas: "Status: Concluídas"
          };
          if (statusFilterLabel) {
            statusFilterLabel.textContent = labels[filtroStatus] || "Status";
          }

          statusFilterMenu.hidden = true;
          btnStatusFilter.setAttribute("aria-expanded", "false");
          renderizarLista();
        });
      });
    }

    if (btnRecFilter && recFilterMenu) {
      btnRecFilter.addEventListener("click", e => {
        e.stopPropagation();
        const isOpen = !recFilterMenu.hidden;
        recFilterMenu.hidden = isOpen;
        btnRecFilter.setAttribute("aria-expanded", String(!isOpen));
        if (statusFilterMenu) {
          statusFilterMenu.hidden = true;
          if (btnStatusFilter) btnStatusFilter.setAttribute("aria-expanded", "false");
        }
        if (sortFilterMenu) {
          sortFilterMenu.hidden = true;
          if (btnSortFilter) btnSortFilter.setAttribute("aria-expanded", "false");
        }
      });

      recFilterMenu.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click", () => {
          filtroRecorrencia = item.dataset.rec;
          try { localStorage.setItem("managertask_rec", filtroRecorrencia); } catch (e) {}
          recFilterMenu.querySelectorAll(".dropdown-item").forEach(el => {
            el.classList.remove("is-selected");
            const chk = el.querySelector(".dropdown-check");
            if (chk) chk.textContent = "";
          });
          item.classList.add("is-selected");
          const chk = item.querySelector(".dropdown-check");
          if (chk) chk.textContent = "✓";

          const labels = {
            todas: "Repetição: Todas",
            diaria: "Repetição: Diárias",
            semanal: "Repetição: Semanais",
            mensal: "Repetição: Mensais",
            anual: "Repetição: Anuais",
            unica: "Repetição: Única vez"
          };
          if (recFilterLabel) {
            recFilterLabel.textContent = labels[filtroRecorrencia] || "Repetição";
          }

          recFilterMenu.hidden = true;
          btnRecFilter.setAttribute("aria-expanded", "false");
          renderizarLista();
        });
      });
    }

    if (btnSortFilter && sortFilterMenu) {
      btnSortFilter.addEventListener("click", e => {
        e.stopPropagation();
        const isOpen = !sortFilterMenu.hidden;
        sortFilterMenu.hidden = isOpen;
        btnSortFilter.setAttribute("aria-expanded", String(!isOpen));
        if (statusFilterMenu) {
          statusFilterMenu.hidden = true;
          if (btnStatusFilter) btnStatusFilter.setAttribute("aria-expanded", "false");
        }
        if (recFilterMenu) {
          recFilterMenu.hidden = true;
          if (btnRecFilter) btnRecFilter.setAttribute("aria-expanded", "false");
        }
      });

      sortFilterMenu.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click", () => {
          ordenacao = item.dataset.sort;
          try { localStorage.setItem("managertask_sort", ordenacao); } catch (e) {}
          sortFilterMenu.querySelectorAll(".dropdown-item").forEach(el => {
            el.classList.remove("is-selected");
            const chk = el.querySelector(".dropdown-check");
            if (chk) chk.textContent = "";
          });
          item.classList.add("is-selected");
          const chk = item.querySelector(".dropdown-check");
          if (chk) chk.textContent = "✓";

          const labels = {
            recente: "Ordenar: Recentes",
            prioridade: "Ordenar: Prioridade",
            recorrencia: "Ordenar: Repetição",
            vencimento: "Ordenar: Prazo",
            alfabetica: "Ordenar: A-Z",
            antiga: "Ordenar: Antigas"
          };
          if (sortFilterLabel) {
            sortFilterLabel.textContent = labels[ordenacao] || "Ordenar";
          }

          sortFilterMenu.hidden = true;
          btnSortFilter.setAttribute("aria-expanded", "false");
          renderizarLista();
        });
      });
    }

    document.addEventListener("click", e => {
      if (statusFilterMenu && !statusFilterMenu.contains(e.target) && e.target !== btnStatusFilter) {
        statusFilterMenu.hidden = true;
        if (btnStatusFilter) btnStatusFilter.setAttribute("aria-expanded", "false");
      }
      if (recFilterMenu && !recFilterMenu.contains(e.target) && e.target !== btnRecFilter) {
        recFilterMenu.hidden = true;
        if (btnRecFilter) btnRecFilter.setAttribute("aria-expanded", "false");
      }
      if (sortFilterMenu && !sortFilterMenu.contains(e.target) && e.target !== btnSortFilter) {
        sortFilterMenu.hidden = true;
        if (btnSortFilter) btnSortFilter.setAttribute("aria-expanded", "false");
      }
    });

    document.querySelectorAll(".cat-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        filtroCategoria = chip.dataset.category;
        try { localStorage.setItem("managertask_cat", filtroCategoria); } catch (e) {}
        renderizarLista();
      });
    });

    if (btnClearCompleted) {
      btnClearCompleted.addEventListener("click", limparConcluidas);
    }
    const exportBtn = document.getElementById("btnExportTasks");
    if (exportBtn) {
      exportBtn.addEventListener("click", exportarTarefas);
    }
    if (btnImportTasks && importFileInput) {
      btnImportTasks.addEventListener("click", () => {
        importFileInput.click();
      });
      importFileInput.addEventListener("change", e => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          importarTarefasArquivo(file);
        }
      });
    }

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

    if (btnCloseNoteModalX) btnCloseNoteModalX.addEventListener("click", fecharModalNota);
    if (btnCloseNoteModal) btnCloseNoteModal.addEventListener("click", fecharModalNota);
    if (noteModalOverlay) {
      noteModalOverlay.addEventListener("click", e => {
        if (e.target === noteModalOverlay) fecharModalNota();
      });
    }
    if (btnEditFromNoteModal) {
      btnEditFromNoteModal.addEventListener("click", () => {
        const t = tarefas.find(item => item.id === idParaVerNota);
        fecharModalNota();
        if (t) abrirModalEdicao(t);
      });
    }

    if (btnCloseAiSuggestModalX) btnCloseAiSuggestModalX.addEventListener("click", fecharModalSugestoesIA);
    if (btnCloseAiSuggestModal) btnCloseAiSuggestModal.addEventListener("click", fecharModalSugestoesIA);
    if (aiSuggestModalOverlay) {
      aiSuggestModalOverlay.addEventListener("click", e => {
        if (e.target === aiSuggestModalOverlay) fecharModalSugestoesIA();
      });
    }

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        if (statusFilterMenu) statusFilterMenu.hidden = true;
        if (btnStatusFilter) btnStatusFilter.setAttribute("aria-expanded", "false");
        if (recFilterMenu) recFilterMenu.hidden = true;
        if (btnRecFilter) btnRecFilter.setAttribute("aria-expanded", "false");
        if (sortFilterMenu) sortFilterMenu.hidden = true;
        if (btnSortFilter) btnSortFilter.setAttribute("aria-expanded", "false");
        calendarPopover.hidden = true;
        dateTrigger.setAttribute("aria-expanded", "false");
        fecharModalCriacao();
        fecharModalEdicao();
        fecharModalConfirmacao();
        fecharModalNota();
        fecharModalSugestoesIA();
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
