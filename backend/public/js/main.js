window.socket = io();

// ── Hamburger sidebar ─────────────────────────────────
const hamburger = document.getElementById('hamburger');
const sidebar   = document.getElementById('sidebar');
const overlay   = document.getElementById('overlay');
const closeBtn  = document.getElementById('sidebarClose');

function openSidebar()  { sidebar.classList.add('open');    overlay.classList.add('visible'); }
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('visible'); }

if (hamburger) hamburger.addEventListener('click', openSidebar);
if (closeBtn)  closeBtn.addEventListener('click',  closeSidebar);
if (overlay)   overlay.addEventListener('click',   closeSidebar);
