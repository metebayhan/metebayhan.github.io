// SECTION: State & Storage Helpers
const STORAGE_KEY = "tvWallMessages";

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Kayıtlar okunamadı", e);
    return [];
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Kayıtlar kaydedilemedi", e);
  }
}

function createEntry({ title, message, phone }) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    title,
    message,
    phone,
    createdAt: new Date().toISOString(),
  };
}

// SECTION: DOM References
const bodyEl = document.body;
const formEl = document.getElementById("entryForm");
const titleInput = document.getElementById("title");
const messageInput = document.getElementById("message");
const phoneInput = document.getElementById("phone");
const clearAllBtn = document.getElementById("clearAllBtn");
const listViewEl = document.getElementById("listView");
const cardViewEl = document.getElementById("cardView");
const emptyStateEl = document.getElementById("emptyState");
const listViewBtn = document.getElementById("listViewBtn");
const cardViewBtn = document.getElementById("cardViewBtn");
const modeToggleBtn = document.getElementById("modeToggle");
const lastUpdatedEl = document.getElementById("lastUpdated");

// SECTION: Render Helpers
function formatTime(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function updateLastUpdated() {
  const now = new Date();
  lastUpdatedEl.textContent = now.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function renderEntries() {
  const entries = loadEntries();

  // Empty state toggle
  if (!entries.length) {
    emptyStateEl.style.display = "block";
    listViewEl.classList.remove("entries--active");
    cardViewEl.classList.remove("entries--active");
    listViewEl.innerHTML = "";
    cardViewEl.innerHTML = "";
    return;
  }
  emptyStateEl.style.display = "none";

  const activeView =
    listViewBtn.classList.contains("chip--active") ? "list" : "cards";

  listViewEl.classList.toggle("entries--active", activeView === "list");
  cardViewEl.classList.toggle("entries--active", activeView === "cards");

  listViewEl.innerHTML = "";
  cardViewEl.innerHTML = "";

  entries
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((entry) => {
      const row = document.createElement("article");
      row.className = "entry-row";
      row.dataset.id = entry.id;
      row.innerHTML = `
        <div class="entry-row-header">
          <h3 class="entry-title">${entry.title}</h3>
          <button class="entry-delete" type="button" aria-label="Kaydı sil">
            Sil
          </button>
        </div>
        <p class="entry-message">${entry.message}</p>
        <div class="entry-meta">
          <span class="entry-phone">${entry.phone}</span>
          <span> • ${formatTime(entry.createdAt)}
        </div>
      `;
      listViewEl.appendChild(row);

      const card = document.createElement("article");
      card.className = "entry-card";
      card.dataset.id = entry.id;
      card.innerHTML = `
        <div class="entry-card-header">
          <h3 class="entry-title">${entry.title}</h3>
          <button class="entry-delete" type="button" aria-label="Kaydı sil">
            Sil
          </button>
        </div>
        <p class="entry-message">${entry.message}</p>
        <div class="entry-meta">
          <span class="entry-phone">${entry.phone}</span>
          <span> • ${formatTime(entry.createdAt)}
        </div>
      `;
      cardViewEl.appendChild(card);
    });

  updateLastUpdated();
}

// SECTION: Mutations
function addEntryFromForm(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const message = messageInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!title || !message || !phone) return;

  const entries = loadEntries();
  entries.push(createEntry({ title, message, phone }));
  saveEntries(entries);

  formEl.reset();
  titleInput.focus();
  renderEntries();
}

function deleteEntry(id) {
  const entries = loadEntries();
  const next = entries.filter((e) => e.id !== id);
  saveEntries(next);
  renderEntries();
}

function clearAllEntries() {
  const entries = loadEntries();
  if (!entries.length) return;

  const confirmed = window.confirm(
    "Tüm kayıtları silmek istediğinize emin misiniz?"
  );
  if (!confirmed) return;

  saveEntries([]);
  renderEntries();
}

// SECTION: View & Mode Toggles
function setView(view) {
  if (view === "list") {
    listViewBtn.classList.add("chip--active");
    cardViewBtn.classList.remove("chip--active");
  } else {
    cardViewBtn.classList.add("chip--active");
    listViewBtn.classList.remove("chip--active");
  }
  renderEntries();
}

function toggleMode() {
  const current = bodyEl.getAttribute("data-mode") || "phone";
  const next = current === "phone" ? "tv" : "phone";
  bodyEl.setAttribute("data-mode", next);
}

// SECTION: Auto Refresh
let refreshIntervalId = null;

function startAutoRefresh() {
  if (refreshIntervalId !== null) return; // already running
  refreshIntervalId = window.setInterval(() => {
    renderEntries();
  }, 5000); // 5 saniyede bir yenileme
}

function stopAutoRefresh() {
  if (refreshIntervalId !== null) {
    window.clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}

// SECTION: Event Handlers
if (formEl) {
  formEl.addEventListener("submit", addEntryFromForm);
}

if (clearAllBtn) {
  clearAllBtn.addEventListener("click", clearAllEntries);
}

listViewEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("entry-delete")) return;

  const article = target.closest("article");
  if (!article) return;
  const id = article.dataset.id;
  if (!id) return;

  deleteEntry(id);
});

cardViewEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("entry-delete")) return;

  const article = target.closest("article");
  if (!article) return;
  const id = article.dataset.id;
  if (!id) return;

  deleteEntry(id);
});

if (listViewBtn && cardViewBtn) {
  listViewBtn.addEventListener("click", () => setView("list"));
  cardViewBtn.addEventListener("click", () => setView("cards"));
}

if (modeToggleBtn) {
  modeToggleBtn.addEventListener("click", toggleMode);
}

// SECTION: Init
function init() {
  // Varsayılan modu ayarla
  if (!bodyEl.getAttribute("data-mode")) {
    bodyEl.setAttribute("data-mode", "phone");
  }

  renderEntries();
  startAutoRefresh();
}

window.addEventListener("DOMContentLoaded", init);
