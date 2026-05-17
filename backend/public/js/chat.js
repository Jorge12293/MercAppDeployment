(() => {
  const socket = window.socket;
  const fab    = document.getElementById('chatFab');
  if (!fab) return;

  const panel        = document.getElementById('chatPanel');
  const closeBtn     = document.getElementById('chatClose');
  const usersList    = document.getElementById('chatUsersList');
  const chatEmpty    = document.getElementById('chatEmpty');
  const chatConv     = document.getElementById('chatConv');
  const convHeader   = document.getElementById('chatConvHeader');
  const messages     = document.getElementById('chatMessages');
  const form         = document.getElementById('chatForm');
  const input        = document.getElementById('chatInput');
  const badge        = document.getElementById('chatBadge');

  const myName     = fab.dataset.nombre;
  const SS         = sessionStorage; // alias corto

  // Estado restaurado desde sessionStorage (por pestaña)
  let panelOpen     = SS.getItem('chat_open')   === 'true';
  let usuarioActivo = SS.getItem('chat_activo') || null;
  let listaConectados = [];

  const noLeidos      = new Map(); // nombre → count
  const conversaciones = new Map(); // nombre → [mensajes]

  // Restaurar no-leídos guardados en esta pestaña
  try {
    const saved = JSON.parse(SS.getItem('chat_noLeidos') || '{}');
    Object.entries(saved).forEach(([k, v]) => noLeidos.set(k, v));
  } catch (_) {}

  // ── Persistir estado en sessionStorage ───────────
  function saveState() {
    SS.setItem('chat_open',     panelOpen);
    SS.setItem('chat_activo',   usuarioActivo || '');
    SS.setItem('chat_noLeidos', JSON.stringify(Object.fromEntries(noLeidos)));
  }

  // ── Abrir / cerrar panel ──────────────────────────
  function openPanel() {
    panelOpen = true;
    panel.classList.add('open');
    fab.classList.add('active');
    actualizarBadgeGlobal();
    saveState();
  }

  function closePanel() {
    panelOpen = false;
    panel.classList.remove('open');
    fab.classList.remove('active');
    saveState();
  }

  fab.addEventListener('click',      () => panelOpen ? closePanel() : openPanel());
  closeBtn.addEventListener('click', closePanel);

  // ── Seleccionar usuario ───────────────────────────
  function seleccionarUsuario(nombre) {
    usuarioActivo = nombre;
    noLeidos.set(nombre, 0);
    actualizarBadgeGlobal();
    saveState();

    convHeader.textContent = nombre;
    renderConversacion(conversaciones.get(nombre) || []);

    if (!conversaciones.has(nombre)) {
      socket.emit('chat:cargar', nombre);
    }

    chatEmpty.style.display = 'none';
    chatConv.style.display  = 'flex';
    renderUsersList(listaConectados);
    input.focus();
  }

  // ── Renderizar conversación ───────────────────────
  function renderConversacion(msgs) {
    messages.innerHTML = '';
    msgs.forEach(agregarBurbuja);
    scrollBottom();
  }

  function agregarBurbuja(msg) {
    const isMe = msg.de === myName;
    const div  = document.createElement('div');
    div.className = `msg ${isMe ? 'msg--me' : 'msg--other'}`;
    div.innerHTML = `
      <div class="msg-bubble">${esc(msg.texto)}</div>
      <span class="msg-time">${msg.hora}</span>
    `;
    messages.appendChild(div);
  }

  function scrollBottom() { messages.scrollTop = messages.scrollHeight; }

  // ── Renderizar lista de usuarios ──────────────────
  function renderUsersList(lista) {
    usersList.innerHTML = '';
    lista.forEach(nombre => {
      if (nombre === myName) return;
      const unread = noLeidos.get(nombre) || 0;
      const li = document.createElement('li');
      li.className = `user-item${usuarioActivo === nombre ? ' selected' : ''}`;
      li.innerHTML = `
        <span class="user-dot"></span>
        <span class="user-name">${esc(nombre)}</span>
        ${unread > 0 ? `<span class="user-unread">${unread > 9 ? '9+' : unread}</span>` : ''}
      `;
      li.addEventListener('click', () => seleccionarUsuario(nombre));
      usersList.appendChild(li);
    });
  }

  // ── Badge global FAB ──────────────────────────────
  function actualizarBadgeGlobal() {
    const total = [...noLeidos.values()].reduce((a, b) => a + b, 0);
    badge.textContent = total > 9 ? '9+' : total;
    badge.classList.toggle('has-unread', total > 0);
  }

  // ── Eventos Socket.io ─────────────────────────────
  socket.on('chat:usuarios', (lista) => {
    listaConectados = lista;
    renderUsersList(lista);

    // Si había un usuario activo guardado en esta pestaña, retomarlo
    if (usuarioActivo && lista.includes(usuarioActivo)) {
      seleccionarUsuario(usuarioActivo);
    } else if (usuarioActivo && !lista.includes(usuarioActivo)) {
      // El usuario ya no está conectado → resetear conversación activa
      usuarioActivo = null;
      chatConv.style.display  = 'none';
      chatEmpty.style.display = 'flex';
      saveState();
    }
  });

  socket.on('chat:historial', ({ con, mensajes }) => {
    conversaciones.set(con, mensajes);
    if (usuarioActivo === con) renderConversacion(mensajes);
  });

  socket.on('chat:mensaje:privado', (msg) => {
    const otro = msg.de === myName ? msg.para : msg.de;

    if (!conversaciones.has(otro)) conversaciones.set(otro, []);
    conversaciones.get(otro).push(msg);

    if (usuarioActivo === otro) {
      agregarBurbuja(msg);
      scrollBottom();
    } else {
      noLeidos.set(otro, (noLeidos.get(otro) || 0) + 1);
      actualizarBadgeGlobal();
      renderUsersList(listaConectados);
      saveState();
    }
  });

  // ── Enviar mensaje ────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto || !usuarioActivo) return;
    socket.emit('chat:privado', { para: usuarioActivo, texto });
    input.value = '';
    input.focus();
  });

  // ── Escape HTML ───────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ── Init ──────────────────────────────────────────
  chatConv.style.display  = 'none';
  chatEmpty.style.display = 'flex';

  // Restaurar panel abierto si estaba abierto en esta pestaña
  if (panelOpen) openPanel();

  actualizarBadgeGlobal();
})();
