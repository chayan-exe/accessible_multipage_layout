// Accessible interactions: keyboard-friendly menu, native dialogs, and forms.
document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector("#sidebar");

  if (menuButton && sidebar) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      sidebar.classList.toggle("is-open", !isOpen);
    });
  }

  document.querySelectorAll("[data-modal-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.getElementById(button.dataset.modalTarget);
      if (modal) {
        modal.showModal();
      }
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest("dialog");
      if (modal) {
        modal.close();
      }
    });
  });

  const addUserForm = document.querySelector("#add-user-form");
  const formMessage = document.querySelector("#form-message");

  if (addUserForm && formMessage) {
    addUserForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!addUserForm.checkValidity()) {
        addUserForm.reportValidity();
        return;
      }

      formMessage.textContent = "User details validated successfully.";
      addUserForm.reset();
    });
  }

  const settingsForm = document.querySelector("#settings-form");
  const settingsMessage = document.querySelector("#settings-message");

  if (settingsForm && settingsMessage) {
    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!settingsForm.checkValidity()) {
        settingsForm.reportValidity();
        return;
      }

      settingsMessage.textContent = "Settings validated successfully.";
    });
  }
});

// REST API data module: async/await, search/category/sort, localStorage cache, skeletons and errors.
const PRODUCT_CACHE_KEY = "accessboard_products_v1";
const PRODUCT_CACHE_TTL = 1000 * 60 * 10;

async function loadProducts() {
  const grid = document.querySelector("#product-grid");
  const loading = document.querySelector("#product-loading");
  const error = document.querySelector("#api-error");
  const search = document.querySelector("#product-search");
  const category = document.querySelector("#product-category");
  const sort = document.querySelector("#product-sort");
  if (!grid || !loading || !error || !search || !category || !sort) return;

  let products = [];
  const cached = localStorage.getItem(PRODUCT_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < PRODUCT_CACHE_TTL && Array.isArray(parsed.data)) products = parsed.data;
    } catch { localStorage.removeItem(PRODUCT_CACHE_KEY); }
  }

  const render = () => {
    const query = search.value.trim().toLowerCase();
    let visible = products.filter(p =>
      (category.value === "all" || p.category === category.value) &&
      `${p.title} ${p.description} ${p.category}`.toLowerCase().includes(query)
    );
    if (sort.value === "price-asc") visible.sort((a,b) => a.price - b.price);
    if (sort.value === "price-desc") visible.sort((a,b) => b.price - a.price);
    if (sort.value === "title") visible.sort((a,b) => a.title.localeCompare(b.title));
    grid.innerHTML = visible.length ? visible.map(p => `
      <article class="data-item">
        <img src="${p.image}" alt="${escapeHTML(p.title)}" loading="lazy">
        <p class="eyebrow">${escapeHTML(p.category)}</p>
        <h3>${escapeHTML(p.title)}</h3>
        <p>${escapeHTML(p.description.slice(0, 110))}...</p>
        <strong>$${Number(p.price).toFixed(2)}</strong>
      </article>`).join("") : "<p>No matching products found.</p>";
  };

  if (!products.length) {
    try {
      const response = await fetch("https://fakestoreapi.com/products");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      products = await response.json();
      localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({timestamp: Date.now(), data: products}));
    } catch (err) {
      error.textContent = "We couldn't load the live product data. Please check your connection and try again.";
      error.hidden = false;
      loading.hidden = true;
      return;
    }
  }

  [...new Set(products.map(p => p.category))].sort().forEach(c => {
    const option = document.createElement("option"); option.value = c; option.textContent = c; category.append(option);
  });
  loading.hidden = true;
  render();
  [search, category, sort].forEach(el => el.addEventListener("input", render));
  [category, sort].forEach(el => el.addEventListener("change", render));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("accessboard_theme");
  if (savedTheme) root.dataset.theme = savedTheme;
});

document.addEventListener("click", (event) => {
  if (event.target.id !== "theme-toggle") return;
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("accessboard_theme", next);
});
