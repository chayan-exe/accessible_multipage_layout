const KEYS = { products: 'accessboard_products_v2', theme: 'accessboard_theme', auth: 'accessboard_auth_v1', users: 'accessboard_users_v1', settings: 'accessboard_settings_v1' };
const API_URL = 'https://fakestoreapi.com/products';
const CACHE_TTL = 10 * 60 * 1000;

const seedUsers = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@example.com', role: 'Editor', status: 'Active' },
  { id: 2, name: 'Meera Patel', email: 'meera@example.com', role: 'Admin', status: 'Active' },
  { id: 3, name: 'Kabir Singh', email: 'kabir@example.com', role: 'Viewer', status: 'Pending' }
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function safeJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function escapeHTML(value) { return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c])); }
function showMessage(el, message, type = 'success') { if (!el) return; el.textContent = message; el.className = `form-message ${type}`; }

function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem(KEYS.theme);
  if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
  $('#theme-toggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next; localStorage.setItem(KEYS.theme, next);
  });
}

function initSidebar() {
  $$('.menu-toggle').forEach(button => button.addEventListener('click', () => {
    const sidebar = document.getElementById(button.getAttribute('aria-controls'));
    if (!sidebar) return;
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open)); sidebar.classList.toggle('is-open', !open);
  }));
}

function initModals() {
  $$('[data-modal-target]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.modalTarget)?.showModal()));
  $$('[data-close-modal]').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
}

function initAuth() {
  const form = $('#login-form');
  if (!form) return;
  const existing = safeJSON(KEYS.auth, null);
  if (existing?.authenticated) { window.location.href = 'index.html'; return; }
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const username = $('#login-username').value.trim();
    const password = $('#login-password').value;
    const message = $('#login-message');
    if (username === 'admin' && password === 'admin123') {
      saveJSON(KEYS.auth, { authenticated: true, username, loginAt: Date.now() });
      window.location.href = 'index.html';
    } else showMessage(message, 'Invalid demo credentials. Use admin / admin123.', 'error');
  });
}

function requireAuth() {
  if ($('#login-form')) return true;
  const auth = safeJSON(KEYS.auth, null);
  if (!auth?.authenticated) { window.location.href = 'login.html'; return false; }
  $('#logout-button')?.addEventListener('click', () => { localStorage.removeItem(KEYS.auth); window.location.href = 'login.html'; });
  return true;
}

function initProducts() {
  const grid = $('#product-grid'); if (!grid) return;
  const loading = $('#product-loading'), error = $('#api-error');
  const search = $('#product-search'), category = $('#product-category'), sort = $('#product-sort');
  const addModal = $('#add-product-modal'), addForm = $('#add-product-form');
  let products = [];

  const render = () => {
    const q = search.value.trim().toLowerCase();
    let visible = products.filter(p => (category.value === 'all' || p.category === category.value) && `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(q));
    if (sort.value === 'price-asc') visible.sort((a,b) => a.price-b.price);
    if (sort.value === 'price-desc') visible.sort((a,b) => b.price-a.price);
    if (sort.value === 'title') visible.sort((a,b) => a.title.localeCompare(b.title));
    grid.innerHTML = visible.length ? visible.map(p => `<article class="data-item"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.title)}" loading="lazy"><p class="eyebrow">${escapeHTML(p.category)}</p><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description.slice(0,110))}${p.description.length > 110 ? '...' : ''}</p><strong>$${Number(p.price).toFixed(2)}</strong><div class="card-actions"><button class="button small" type="button" data-edit-product="${p.id}">Edit</button><button class="button danger small" type="button" data-delete-product="${p.id}">Delete</button></div></article>`).join('') : '<p class="empty-state">No matching products found.</p>';
  };

  const hydrate = async () => {
    const cached = safeJSON(KEYS.products, null);
    if (cached?.timestamp && Date.now() - cached.timestamp < CACHE_TTL && Array.isArray(cached.data)) products = cached.data;
    if (!products.length) {
      try {
        const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        products = await response.json(); saveJSON(KEYS.products, { timestamp: Date.now(), data: products });
      } catch {
        error.hidden = false; error.textContent = 'Live catalog could not be loaded. Check your connection and use Retry.';
        $('#retry-products')?.removeAttribute('hidden'); loading.hidden = true; return;
      }
    }
    const cats = [...new Set(products.map(p => p.category))].sort();
    cats.forEach(c => { if (![...category.options].some(o => o.value === c)) category.add(new Option(c, c)); });
    loading.hidden = true; error.hidden = true; render();
  };

  hydrate();
  [search, category, sort].forEach(el => el.addEventListener('input', render));
  $('#retry-products')?.addEventListener('click', () => { localStorage.removeItem(KEYS.products); loading.hidden = false; hydrate(); });

  grid.addEventListener('click', e => {
    const edit = e.target.closest('[data-edit-product]'); const del = e.target.closest('[data-delete-product]');
    if (edit) {
      const p = products.find(x => String(x.id) === edit.dataset.editProduct); if (!p) return;
      $('#product-id').value = p.id; $('#product-title').value = p.title; $('#product-price').value = p.price; $('#product-category-input').value = p.category; $('#product-image').value = p.image; $('#product-description').value = p.description; $('#product-modal-title').textContent = 'Edit product'; addModal.showModal();
    }
    if (del) {
      const id = Number(del.dataset.deleteProduct); products = products.filter(p => p.id !== id); saveJSON(KEYS.products, { timestamp: Date.now(), data: products }); render();
    }
  });

  addForm?.addEventListener('submit', e => {
    e.preventDefault(); if (!addForm.checkValidity()) { addForm.reportValidity(); return; }
    const id = Number($('#product-id').value) || Date.now();
    const item = { id, title: $('#product-title').value.trim(), price: Number($('#product-price').value), category: $('#product-category-input').value.trim(), image: $('#product-image').value.trim() || 'https://placehold.co/600x400?text=Product', description: $('#product-description').value.trim(), rating: { rate: 0, count: 0 } };
    const index = products.findIndex(p => p.id === id); if (index >= 0) products[index] = item; else products.unshift(item);
    saveJSON(KEYS.products, { timestamp: Date.now(), data: products }); render(); addForm.reset(); $('#product-id').value = ''; $('#product-modal-title').textContent = 'Add product'; addModal.close();
  });
}

function initUsers() {
  const tbody = $('#users-body'); if (!tbody) return;
  let users = safeJSON(KEYS.users, seedUsers); saveJSON(KEYS.users, users);
  const render = () => { tbody.innerHTML = users.map(u => `<tr><th scope="row">${escapeHTML(u.name)}</th><td>${escapeHTML(u.email)}</td><td>${escapeHTML(u.role)}</td><td>${escapeHTML(u.status)}</td><td><button class="button small" data-edit-user="${u.id}" type="button">Edit</button> <button class="button danger small" data-delete-user="${u.id}" type="button">Delete</button></td></tr>`).join(''); };
  render();
  const form = $('#add-user-form'); form?.addEventListener('submit', e => { e.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const id = Number($('#user-id').value) || Date.now(); const user = { id, name: $('#user-name').value.trim(), email: $('#user-email').value.trim(), role: $('#user-role').value, status: 'Active' }; const idx = users.findIndex(u => u.id === id); if (idx >= 0) users[idx] = user; else users.push(user); saveJSON(KEYS.users, users); render(); form.reset(); $('#user-id').value = ''; $('#user-modal-title').textContent = 'Add a user'; $('#add-user-modal').close(); });
  tbody.addEventListener('click', e => { const edit = e.target.closest('[data-edit-user]'); const del = e.target.closest('[data-delete-user]'); if (edit) { const u = users.find(x => String(x.id) === edit.dataset.editUser); $('#user-id').value=u.id; $('#user-name').value=u.name; $('#user-email').value=u.email; $('#user-role').value=u.role.toLowerCase(); $('#user-modal-title').textContent='Edit user'; $('#add-user-modal').showModal(); } if (del) { users = users.filter(u => String(u.id) !== del.dataset.deleteUser); saveJSON(KEYS.users, users); render(); } });
}

function initSettings() {
  const form = $('#settings-form'); if (!form) return; const settings = safeJSON(KEYS.settings, {}); ['full-name','email','website','language'].forEach(id => { if (settings[id]) $(`#${id}`).value = settings[id]; }); if (typeof settings.notifications === 'boolean') $('#notifications').checked = settings.notifications;
  form.addEventListener('submit', e => { e.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } const data = Object.fromEntries(new FormData(form)); data.notifications = $('#notifications').checked; saveJSON(KEYS.settings, data); showMessage($('#settings-message'), 'Settings saved locally.'); });
}

function init() { initTheme(); initSidebar(); initModals(); initAuth(); if (!requireAuth()) return; initProducts(); initUsers(); initSettings(); }
document.addEventListener('DOMContentLoaded', init);
