/* =========================================================
   AdminPanel — full product/category admin with PHP backend
   ========================================================= */

const API = {
  session:    'api/session.php',
  login:      'api/login.php',
  logout:     'api/logout.php',
  products:   'api/products.php',
  categories: 'api/categories.php',
  upload:     'api/upload.php',
};

export default class AdminPanel {
  constructor({ root }) {
    this.root = document.querySelector(root);
    if (!this.root) return;

    this.products   = [];
    this.categories = [];
    this.view       = 'login';
    this.editProduct = null;
    this.search      = '';
    this.filterCat   = '';
    this.pendingDeleteId = null;

    this._init();
  }

  /* ======================================================
     Boot
  ====================================================== */
  async _init() {
    this._renderToasts();
    const r = await this._api('GET', API.session);
    if (r?.loggedIn) {
      await this._loadData();
      this._showView('dashboard');
    } else {
      this._showView('login');
    }
  }

  async _loadData() {
    const [products, cats] = await Promise.all([
      this._api('GET', API.products),
      this._api('GET', API.categories),
    ]);
    this.products   = Array.isArray(products) ? products : [];
    this.categories = Array.isArray(cats)     ? cats     : [];
  }

  /* ======================================================
     API helper
  ====================================================== */
  async _api(method, url, body = null, isForm = false) {
    try {
      const opts = { method, credentials: 'include' };
      if (body && !isForm) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body    = JSON.stringify(body);
      }
      if (body && isForm) opts.body = body;

      const r    = await fetch(url, opts);
      const text = await r.text();

      /* Detect Live Server / static server serving raw PHP source */
      if (text.trim().startsWith('<?php') || text.trim().startsWith('<?')) {
        this._showPhpError();
        return null;
      }

      let json = {};
      try { json = JSON.parse(text); } catch {}

      if (!r.ok && json.error) this._toast(json.error, 'error');
      return r.ok ? json : null;
    } catch {
      this._showPhpError();
      return null;
    }
  }

  _showPhpError() {
    /* Show once — don't spam toasts */
    if (this._phpErrorShown) return;
    this._phpErrorShown = true;

    const existing = document.querySelector('.adm-php-error');
    if (existing) return;

    const banner = document.createElement('div');
    banner.className = 'adm-php-error';
    banner.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:9999;
      background:#1e293b;color:#f1f5f9;
      font-family:'Poppins',sans-serif;font-size:14px;
      padding:16px 24px;display:flex;align-items:center;gap:16px;
      box-shadow:0 4px 20px rgba(0,0,0,0.4);
    `;
    banner.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" style="flex-shrink:0">
        <triangle><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></triangle>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div style="flex:1">
        <strong style="color:#f59e0b;">PHP server not running.</strong>
        You are using Live Server (port 5500) which cannot execute PHP.
        <br>
        <span style="color:#94a3b8;">
          Double-click <strong style="color:#fff;">start-server.bat</strong> in the project folder,
          then open <strong style="color:#fff;">http://localhost:8000/admin.html</strong>
        </span>
      </div>
      <button onclick="this.parentElement.remove()" style="
        background:rgba(255,255,255,0.1);border:none;color:#fff;
        padding:6px 14px;border-radius:8px;cursor:pointer;font-size:13px;
        font-family:inherit;flex-shrink:0;
      ">✕ Close</button>
    `;
    document.body.prepend(banner);
  }

  /* ======================================================
     Routing
  ====================================================== */
  _showView(view, data = null) {
    this.view = view;
    if (view === 'login') { this._renderLogin(); return; }

    if (!this.root.querySelector('.adm-layout')) this._renderShell();

    this.editProduct = data;
    this._updateNav(view);

    const content = this.root.querySelector('.adm-page');
    if (view === 'dashboard')   this._renderDashboard(content);
    if (view === 'products')    this._renderProducts(content);
    if (view === 'product-form') this._renderProductForm(content, data);
    if (view === 'categories')  this._renderCategories(content);
  }

  _updateNav(view) {
    this.root.querySelectorAll('.adm-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view);
    });
    const titles = {
      dashboard:    'Dashboard',
      products:     'Products',
      'product-form': this.editProduct ? 'Edit Product' : 'Add Product',
      categories:   'Categories',
    };
    const title = this.root.querySelector('.adm-topbar-title');
    if (title) title.textContent = titles[view] ?? '';
  }

  /* ======================================================
     Login view
  ====================================================== */
  _renderLogin() {
    this.root.innerHTML = `
      <div class="adm-login-wrap">
        <div class="adm-login-card">
          <div class="adm-login-logo">
            <img src="assets/images/logo.png" alt="Clean Water System" width="42" height="42"/>
            <div class="adm-login-logo-text">
              <span class="adm-login-logo-title">CLEAN WATER</span>
              <span class="adm-login-logo-sub">Admin Panel</span>
            </div>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to manage your products and categories.</p>
          <div class="adm-login-error" id="loginError"></div>
          <div class="adm-field">
            <label class="adm-label">Username</label>
            <input id="loginUser" class="adm-input" type="text" placeholder="Enter admin username" autocomplete="username"/>
          </div>
          <div class="adm-field">
            <label class="adm-label">Password</label>
            <input id="loginPass" class="adm-input" type="password" placeholder="Enter admin password" autocomplete="current-password"/>
          </div>
          <button id="loginBtn" class="adm-btn adm-btn-primary" style="width:100%;justify-content:center;padding:13px;">
            Sign In
          </button>
        </div>
      </div>`;

    const btn      = this.root.querySelector('#loginBtn');
    const userIn   = this.root.querySelector('#loginUser');
    const passIn   = this.root.querySelector('#loginPass');
    const err      = this.root.querySelector('#loginError');

    const attempt = async () => {
      const username = userIn.value.trim();
      const password = passIn.value.trim();
      if (!username || !password) { err.textContent = 'Please enter your username and password.'; err.classList.add('show'); return; }
      btn.textContent = 'Signing in…'; btn.disabled = true;
      const r = await this._api('POST', API.login, { username, password });
      if (r) {
        await this._loadData();
        this._showView('dashboard');
      } else {
        err.textContent = 'Incorrect username or password. Try again.';
        err.classList.add('show');
        btn.textContent = 'Sign In'; btn.disabled = false;
        passIn.value = ''; passIn.focus();
      }
    };

    btn.addEventListener('click', attempt);
    userIn.addEventListener('keydown', e => e.key === 'Enter' && attempt());
    passIn.addEventListener('keydown', e => e.key === 'Enter' && attempt());
    userIn.focus();
  }

  /* ======================================================
     Shell (sidebar + topbar)
  ====================================================== */
  _renderShell() {
    this.root.innerHTML = `
      <div class="adm-layout">
        <div class="adm-sidebar-overlay" id="sidebarOverlay" style="display:none;"></div>
        <aside class="adm-sidebar" id="sidebar">
          <div class="adm-sidebar-logo">
            <img src="assets/images/logo.png" alt="Clean Water System" width="36" height="36"/>
            <div class="adm-sidebar-logo-text">
              <span class="adm-sidebar-logo-title">Clean Water</span>
              <span class="adm-sidebar-logo-sub">Admin</span>
            </div>
          </div>
          <nav class="adm-sidebar-nav">
            <div class="adm-nav-section">
              <p class="adm-nav-section-label">Main</p>
              ${this._navItem('dashboard',  this._ico('grid'),    'Dashboard')}
              ${this._navItem('products',   this._ico('box'),     'Products', this.products.length)}
              ${this._navItem('categories', this._ico('tag'),     'Categories', this.categories.length)}
            </div>
            <div class="adm-nav-section">
              <p class="adm-nav-section-label">Quick</p>
              <div class="adm-nav-item" id="navAddProduct">
                ${this._ico('plus')} Add Product
              </div>
            </div>
          </nav>
          <div class="adm-sidebar-footer">
            <a href="index.html" target="_blank" class="adm-nav-item" style="color:rgba(255,255,255,0.5);margin-bottom:6px;">
              ${this._ico('external')} View Site
            </a>
            <button class="adm-logout-btn" id="logoutBtn">
              ${this._ico('logout')} Sign Out
            </button>
          </div>
        </aside>

        <div class="adm-main">
          <header class="adm-topbar">
            <button class="adm-hamburger" id="hamburger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span class="adm-topbar-title">Dashboard</span>
            <div class="adm-topbar-actions">
              <span class="adm-topbar-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#22c55e"><circle cx="12" cy="12" r="10"/></svg>
                Online
              </span>
              <div class="adm-topbar-avatar">A</div>
            </div>
          </header>
          <main class="adm-page" id="pageContent"></main>
        </div>
      </div>

      <!-- Confirm modal -->
      <div class="adm-modal-backdrop" id="confirmModal">
        <div class="adm-modal">
          <div class="adm-modal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </div>
          <h3>Delete Product?</h3>
          <p>This action cannot be undone. The product will be permanently removed.</p>
          <div class="adm-modal-actions">
            <button class="adm-btn adm-btn-secondary" id="cancelDelete">Cancel</button>
            <button class="adm-btn adm-btn-danger" id="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    `;

    /* Nav clicks */
    this.root.querySelectorAll('.adm-nav-item[data-view]').forEach(el => {
      el.addEventListener('click', () => {
        this._closeSidebar();
        this._showView(el.dataset.view);
      });
    });
    this.root.querySelector('#navAddProduct')?.addEventListener('click', () => {
      this._closeSidebar();
      this._showView('product-form', null);
    });

    /* Logout */
    this.root.querySelector('#logoutBtn')?.addEventListener('click', async () => {
      await this._api('POST', API.logout);
      this._showView('login');
    });

    /* Hamburger */
    this.root.querySelector('#hamburger')?.addEventListener('click', () => this._toggleSidebar());
    this.root.querySelector('#sidebarOverlay')?.addEventListener('click', () => this._closeSidebar());

    /* Confirm modal */
    this.root.querySelector('#cancelDelete')?.addEventListener('click', () => this._hideModal());
    this.root.querySelector('#confirmDelete')?.addEventListener('click', () => this._doDelete());
  }

  _toggleSidebar() {
    const s = this.root.querySelector('#sidebar');
    const o = this.root.querySelector('#sidebarOverlay');
    const open = s?.classList.toggle('mobile-open');
    if (o) o.style.display = open ? 'block' : 'none';
  }
  _closeSidebar() {
    this.root.querySelector('#sidebar')?.classList.remove('mobile-open');
    const o = this.root.querySelector('#sidebarOverlay');
    if (o) o.style.display = 'none';
  }

  /* ======================================================
     Dashboard
  ====================================================== */
  _renderDashboard(el) {
    const totalVariants = this.products.reduce((s, p) => s + (p.variants?.length ?? 0), 0);
    const cats = new Set(this.products.map(p => p.category).filter(Boolean));

    el.innerHTML = `
      <div class="adm-stats-grid">
        ${this._statCard('Total Products',    this.products.length,    'blue',  this._ico('box'))}
        ${this._statCard('Categories',        this.categories.length,  'navy',  this._ico('tag'))}
        ${this._statCard('Price Variants',    totalVariants,           'green', this._ico('dollar'))}
        ${this._statCard('Active Categories', cats.size,               'amber', this._ico('grid'))}
      </div>

      <div class="adm-card" style="margin-bottom:24px;">
        <div class="adm-card-header">
          <span class="adm-card-title">Recent Products</span>
          <button class="adm-btn adm-btn-primary adm-btn-sm" id="dashAddBtn">
            ${this._ico('plus')} Add Product
          </button>
        </div>
        <div class="adm-table-wrap">
          ${this._productsTable(this.products.slice(0, 5))}
        </div>
      </div>
    `;

    el.querySelector('#dashAddBtn')?.addEventListener('click', () => this._showView('product-form', null));
    this._bindTableActions(el);
  }

  _statCard(label, value, color, icon) {
    return `
      <div class="adm-stat-card">
        <div class="adm-stat-icon ${color}">${icon}</div>
        <div>
          <p class="adm-stat-number">${value}</p>
          <p class="adm-stat-label">${label}</p>
        </div>
      </div>`;
  }

  /* ======================================================
     Products list
  ====================================================== */
  _renderProducts(el) {
    const cats = [{ id: '', name: 'All Categories' }, ...this.categories];

    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
        <h2 style="font-size:20px;font-weight:700;color:#062b63;flex:1;">All Products</h2>
        <button class="adm-btn adm-btn-primary" id="prodAddBtn">${this._ico('plus')} Add Product</button>
      </div>

      <div class="adm-filter-bar">
        <div class="adm-search-wrap">
          ${this._ico('search')}
          <input class="adm-input adm-search-input" id="prodSearch" placeholder="Search products…" value="${this._esc(this.search)}"/>
        </div>
        <select class="adm-input adm-filter-select" id="prodCatFilter">
          ${cats.map(c => `<option value="${this._esc(c.id)}" ${this.filterCat === c.id ? 'selected' : ''}>${this._esc(c.name)}</option>`).join('')}
        </select>
      </div>

      <div class="adm-card">
        <div class="adm-table-wrap" id="prodTableWrap">
          ${this._filteredTable()}
        </div>
      </div>
    `;

    el.querySelector('#prodAddBtn')?.addEventListener('click', () => this._showView('product-form', null));

    el.querySelector('#prodSearch')?.addEventListener('input', e => {
      this.search = e.target.value;
      el.querySelector('#prodTableWrap').innerHTML = this._filteredTable();
      this._bindTableActions(el.querySelector('#prodTableWrap'));
    });

    el.querySelector('#prodCatFilter')?.addEventListener('change', e => {
      this.filterCat = e.target.value;
      el.querySelector('#prodTableWrap').innerHTML = this._filteredTable();
      this._bindTableActions(el.querySelector('#prodTableWrap'));
    });

    this._bindTableActions(el);
  }

  _filteredTable() {
    const q   = this.search.toLowerCase();
    const cat = this.filterCat;
    const filtered = this.products.filter(p => {
      const matchQ   = !q   || p.name.toLowerCase().includes(q);
      const matchCat = !cat || p.category === cat;
      return matchQ && matchCat;
    });
    return this._productsTable(filtered);
  }

  _productsTable(list) {
    if (!list.length) return `
      <div class="adm-empty">
        ${this._ico('empty', 48)}
        <h3>No products found</h3>
        <p>Add your first product to get started.</p>
        <button class="adm-btn adm-btn-primary" id="emptyAddBtn">${this._ico('plus')} Add Product</button>
      </div>`;

    const catMap = Object.fromEntries(this.categories.map(c => [c.id, c.name]));

    return `
      <table class="adm-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>From Price</th>
            <th>Variants</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(p => `
            <tr>
              <td>${p.image ? `<img class="adm-table-thumb" src="${this._esc(p.image)}" alt="">` : `<div class="adm-table-thumb-placeholder">No img</div>`}</td>
              <td style="font-weight:600;">${this._esc(p.name)}</td>
              <td><span class="adm-badge adm-badge-blue">${this._esc(catMap[p.category] ?? p.category ?? '—')}</span></td>
              <td style="font-weight:600;color:#062b63;">₹${(p.variants?.[0]?.price ?? 0).toLocaleString('en-IN')}</td>
              <td><span class="adm-badge adm-badge-green">${p.variants?.length ?? 0} options</span></td>
              <td>
                <div class="adm-tbl-actions">
                  <button class="adm-btn adm-btn-secondary adm-btn-sm adm-btn-icon edit-btn" data-id="${this._esc(p.id)}" title="Edit">
                    ${this._ico('edit')}
                  </button>
                  <button class="adm-btn adm-btn-sm adm-btn-icon delete-btn" style="background:rgba(239,68,68,0.08);color:#ef4444;" data-id="${this._esc(p.id)}" title="Delete">
                    ${this._ico('trash')}
                  </button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  _bindTableActions(el) {
    el?.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = this.products.find(p => p.id === btn.dataset.id);
        if (p) this._showView('product-form', p);
      });
    });
    el?.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => this._showDeleteModal(btn.dataset.id));
    });
    el?.querySelector('#emptyAddBtn')?.addEventListener('click', () => this._showView('product-form', null));
  }

  /* ======================================================
     Product form
  ====================================================== */
  _renderProductForm(el, product) {
    const p        = product || {};
    const variants = (p.variants?.length ? p.variants : [{ name: '', price: '' }]);
    const descList = (p.descriptionList?.length ? p.descriptionList : ['']);
    this._variantUid  = 0;
    this._imgSlotUid  = 0;

    /* Back-compat: older records may have colors nested under each
       variant, or an older flat `images`/`image` field on a variant —
       pull all of that up into one product-level colors list. */
    const colorsOf = () => {
      if (p.colors?.length) return p.colors;
      const fromVariants = (p.variants ?? []).flatMap((v) => {
        if (v.colors?.length) return v.colors;
        if (v.images?.length) return v.images.map((img) => ({ name: '', image: img }));
        if (v.image) return [{ name: '', image: v.image }];
        return [];
      });
      return fromVariants;
    };

    el.innerHTML = `
      <form id="productForm" novalidate>
        <div class="adm-form-grid">

          <!-- Left column -->
          <div>
            <div class="adm-field">
              <label class="adm-label">Product Name <span>*</span></label>
              <input class="adm-input" id="fName" value="${this._esc(p.name ?? '')}" placeholder="e.g. Aqua Neptune" required/>
            </div>
            <div class="adm-field">
              <label class="adm-label">Category</label>
              <select class="adm-input" id="fCategory">
                <option value="">— Select category —</option>
                ${this.categories.map(c => `<option value="${this._esc(c.id)}" ${p.category === c.id ? 'selected' : ''}>${this._esc(c.name)}</option>`).join('')}
              </select>
            </div>
            <div class="adm-field">
              <label class="adm-label">Included Items</label>
              <input class="adm-input" id="fIncluded" value="${this._esc(p.includedItems ?? '')}" placeholder="e.g. Stand, Cover, Pre-filter, Installation"/>
            </div>

            <!-- Variants -->
            <div class="adm-field">
              <label class="adm-label">Variants (Price Tiers) <span>*</span></label>
              <p class="adm-field-hint">Each variant is a filtration tier with its own fixed price (e.g. "RO + Minerals" — ₹8,999). Picking a variant on the product page changes ONLY the price — it never touches the photo.</p>
              <div class="adm-dyn-list" id="variantList">
                ${variants.map((v, i) => this._variantRow(this._variantUid++, v.name, v.price)).join('')}
              </div>
              <button type="button" class="adm-btn adm-btn-secondary adm-btn-sm" id="addVariant">
                ${this._ico('plus')} Add Variant
              </button>
            </div>

            <!-- Description -->
            <div class="adm-field">
              <label class="adm-label">Description Bullets</label>
              <div class="adm-dyn-list" id="descList">
                ${descList.map((d, i) => this._descRow(i, d)).join('')}
              </div>
              <button type="button" class="adm-btn adm-btn-secondary adm-btn-sm" id="addDesc">
                ${this._ico('plus')} Add Bullet
              </button>
            </div>
          </div>

          <!-- Right column -->
          <div>
            <!-- Main image -->
            <div class="adm-field">
              <label class="adm-label">Main Product Image</label>
              <p class="adm-field-hint">Used on category/listing cards, and as the fallback photo if no colors are set below.</p>
              ${this._imgZone('mainImg', p.image ?? '', 'Drop image here or click to upload')}
            </div>

            <!-- Colors -->
            <div class="adm-field">
              <label class="adm-label">Colors</label>
              <p class="adm-field-hint">Photo choices for this product (e.g. "Green", "Blue"). Picking a color on the product page changes ONLY the photo — it never touches the price or the selected variant.</p>
              <div class="adm-variant-imgs" id="productColors">
                ${colorsOf().length ? colorsOf().map((c) => this._variantColorSlot(this._imgSlotUid++, c.name, c.image)).join('') : ''}
              </div>
              <button type="button" class="adm-btn adm-btn-secondary adm-btn-sm" id="addColor">
                ${this._ico('plus')} Add Color
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="adm-form-actions">
          ${product ? `<button type="button" class="adm-btn adm-btn-danger" id="formDeleteBtn">${this._ico('trash')} Delete Product</button>` : ''}
          <div class="adm-form-actions-right">
            <button type="button" class="adm-btn adm-btn-secondary" id="formCancel">Cancel</button>
            <button type="submit" class="adm-btn adm-btn-primary" id="formSave">
              ${this._ico('save')} ${product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    `;

    /* Dynamic variant rows */
    el.querySelector('#addVariant')?.addEventListener('click', () => {
      const list = el.querySelector('#variantList');
      const uid  = this._variantUid++;
      list.insertAdjacentHTML('beforeend', this._variantRow(uid, '', ''));
      this._bindDynRemove(list);
    });

    /* Dynamic desc rows */
    el.querySelector('#addDesc')?.addEventListener('click', () => {
      const list = el.querySelector('#descList');
      const idx  = list.querySelectorAll('.adm-dyn-row').length;
      list.insertAdjacentHTML('beforeend', this._descRow(idx, ''));
      this._bindDynRemove(list);
    });

    this._bindDynRemove(el.querySelector('#variantList'));
    this._bindDynRemove(el.querySelector('#descList'));

    /* Image zones */
    this._bindImgZone(el, 'mainImg');

    /* Product-level colors */
    el.querySelectorAll('#productColors .adm-variant-img-slot').forEach((slot) => {
      this._bindImgZone(el, `vimg_${slot.dataset.slotUid}`);
      this._bindVariantImgRemove(el, slot.dataset.slotUid);
    });
    el.querySelector('#addColor')?.addEventListener('click', () => {
      const wrap = el.querySelector('#productColors');
      const slotUid = this._imgSlotUid++;
      wrap.insertAdjacentHTML('beforeend', this._variantColorSlot(slotUid, '', ''));
      this._bindImgZone(el, `vimg_${slotUid}`);
      this._bindVariantImgRemove(el, slotUid);
    });

    /* Cancel */
    el.querySelector('#formCancel')?.addEventListener('click', () => this._showView('products'));

    /* Delete from form */
    el.querySelector('#formDeleteBtn')?.addEventListener('click', () => {
      if (product) this._showDeleteModal(product.id);
    });

    /* Submit */
    el.querySelector('#productForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      await this._submitProductForm(el, product);
    });
  }

  _variantRow(uid, name = '', price = '') {
    return `
      <div class="adm-dyn-row adm-variant-row" data-row="variant" data-uid="${uid}">
        <div class="adm-variant-row-fields">
          <input class="adm-input v-name" placeholder="Variant name (e.g. RO + Minerals)" value="${this._esc(String(name))}"/>
          <input class="adm-input adm-input-price v-price" type="number" placeholder="Price ₹" value="${this._esc(String(price))}"/>
          <button type="button" class="adm-dyn-remove" title="Remove">${this._ico('x')}</button>
        </div>
      </div>`;
  }

  _variantColorSlot(slotUid, name = '', image = '') {
    return `
      <div class="adm-variant-img-slot" data-slot-uid="${slotUid}">
        <button type="button" class="adm-variant-img-slot-remove" data-slot-uid="${slotUid}" title="Remove this color">${this._ico('x')}</button>
        <input class="adm-input adm-color-name-input" id="cname_${slotUid}" placeholder="Color name (e.g. Green)" value="${this._esc(String(name))}"/>
        ${this._imgZone(`vimg_${slotUid}`, image, 'Color photo')}
      </div>`;
  }

  /* Removes a single color slot from the product-level colors list. */
  _bindVariantImgRemove(el, slotUid) {
    const btn = el.querySelector(`.adm-variant-img-slot-remove[data-slot-uid="${slotUid}"]`);
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      el.querySelector(`.adm-variant-img-slot[data-slot-uid="${slotUid}"]`)?.remove();
    });
  }

  _descRow(i, text = '') {
    return `
      <div class="adm-dyn-row" data-row="desc">
        <input class="adm-input d-text" placeholder="Description point" value="${this._esc(String(text))}"/>
        <button type="button" class="adm-dyn-remove" title="Remove">${this._ico('x')}</button>
      </div>`;
  }

  _bindDynRemove(container) {
    container?.querySelectorAll('.adm-dyn-remove').forEach(btn => {
      btn.onclick = () => {
        if (container.querySelectorAll('.adm-dyn-row').length > 1) {
          btn.closest('.adm-dyn-row').remove();
        }
      };
    });
  }

  /* ---- Image zone ---- */
  _imgZone(key, current, label) {
    const hasImg = !!current;
    return `
      <div class="adm-img-zone" id="zone_${key}">
        <input type="file" accept="image/*" id="file_${key}"/>
        ${hasImg
          ? `<img class="adm-img-preview" id="preview_${key}" src="${this._esc(current)}" alt=""/>`
          : `<div id="preview_${key}" style="display:none;"><img class="adm-img-preview" src="" alt=""/></div>`}
        <div class="adm-img-zone-icon">${this._ico('upload', 24)}</div>
        <p class="adm-img-zone-text"><strong>Click</strong> or drag to upload<br><small style="font-size:11px;">JPG, PNG, WEBP, AVIF — max 10 MB</small></p>
        <div class="adm-img-url-row">
          <input class="adm-input img-url-input" id="url_${key}" placeholder="Or paste image URL" value="${this._esc(current)}"/>
        </div>
        ${hasImg ? `<button type="button" class="adm-img-clear" id="clear_${key}">✕ Remove image</button>` : ''}
        <input type="hidden" id="val_${key}" value="${this._esc(current)}"/>
      </div>`;
  }

  _bindImgZone(el, key) {
    const zone    = el.querySelector(`#zone_${key}`);
    const fileIn  = el.querySelector(`#file_${key}`);
    const urlIn   = el.querySelector(`#url_${key}`);
    const valIn   = el.querySelector(`#val_${key}`);
    const clearBtn = el.querySelector(`#clear_${key}`);
    if (!zone) return;

    const setPreview = (src) => {
      let previewWrap = el.querySelector(`#preview_${key}`);
      let img = previewWrap?.tagName === 'IMG' ? previewWrap : previewWrap?.querySelector('img');

      if (!img) {
        previewWrap = document.createElement('img');
        previewWrap.className = 'adm-img-preview';
        previewWrap.id = `preview_${key}`;
        zone.insertAdjacentElement('afterbegin', previewWrap);
        img = previewWrap;
      } else if (previewWrap?.tagName !== 'IMG') {
        previewWrap.style.display = 'block';
      }
      if (img) { img.src = src; img.style.display = 'block'; }
      if (valIn) valIn.value = src;
      if (urlIn) urlIn.value = src;
    };

    /* File pick */
    fileIn?.addEventListener('change', async () => {
      const file = fileIn.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      this._toast('Uploading image…', 'info');
      const r = await this._api('POST', API.upload, formData, true);
      if (r?.url) { setPreview(r.url); this._toast('Image uploaded!', 'success'); }
    });

    /* Drag drop */
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', async e => {
      e.preventDefault(); zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      this._toast('Uploading image…', 'info');
      const r = await this._api('POST', API.upload, formData, true);
      if (r?.url) { setPreview(r.url); this._toast('Image uploaded!', 'success'); }
    });

    /* URL input */
    urlIn?.addEventListener('input', () => {
      if (valIn) valIn.value = urlIn.value;
    });
    urlIn?.addEventListener('blur', () => {
      if (urlIn.value.trim()) setPreview(urlIn.value.trim());
    });

    /* Clear */
    clearBtn?.addEventListener('click', () => {
      if (valIn) valIn.value = '';
      if (urlIn) urlIn.value = '';
      const img = el.querySelector(`#preview_${key}`);
      if (img) { img.src = ''; img.style.display = 'none'; }
    });
  }

  /* ---- Collect & submit form ---- */
  async _submitProductForm(el, existing) {
    const name = el.querySelector('#fName')?.value.trim();
    if (!name) { this._toast('Product name is required.', 'error'); return; }

    const getVal = key => el.querySelector(`#val_${key}`)?.value.trim() ?? '';

    const variants = [...el.querySelectorAll('#variantList .adm-variant-row')]
      .map(row => ({
        name:  row.querySelector('.v-name')?.value.trim(),
        price: Number(row.querySelector('.v-price')?.value) || 0,
      }))
      .filter(v => v.name);

    if (!variants.length) { this._toast('Add at least one variant.', 'error'); return; }

    const colors = [...el.querySelectorAll('#productColors .adm-variant-img-slot')]
      .map(slot => ({
        name:  slot.querySelector('.adm-color-name-input')?.value.trim() ?? '',
        image: getVal(`vimg_${slot.dataset.slotUid}`),
      }))
      .filter(c => c.name || c.image);

    const descriptionList = [...el.querySelectorAll('#descList .adm-dyn-row')]
      .map(row => row.querySelector('.d-text')?.value.trim())
      .filter(Boolean);

    const body = {
      name,
      category:        el.querySelector('#fCategory')?.value ?? '',
      includedItems:   el.querySelector('#fIncluded')?.value.trim() ?? '',
      image:           getVal('mainImg'),
      variants,
      colors,
      descriptionList,
    };

    const btn = el.querySelector('#formSave');
    btn.textContent = 'Saving…'; btn.disabled = true;

    let result;
    if (existing) {
      result = await this._api('PUT', `${API.products}?id=${encodeURIComponent(existing.id)}`, body);
    } else {
      result = await this._api('POST', API.products, body);
    }

    btn.disabled = false;
    if (!result) { btn.textContent = existing ? 'Save Changes' : 'Create Product'; return; }

    await this._loadData();
    this._toast(existing ? 'Product updated!' : 'Product created!', 'success');
    this._showView('products');
  }

  /* ======================================================
     Categories
  ====================================================== */
  _renderCategories(el) {
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <h2 style="font-size:20px;font-weight:700;color:#062b63;flex:1;">Categories</h2>
        <button class="adm-btn adm-btn-primary" id="addCatBtn">${this._ico('plus')} Add Category</button>
      </div>

      <div class="adm-card">
        <div class="adm-card-body" id="catListWrap">
          ${this._renderCatList()}
        </div>
      </div>

      <!-- Add / Edit inline form -->
      <div class="adm-card" style="margin-top:24px;display:none;" id="catFormWrap">
        <div class="adm-card-header">
          <span class="adm-card-title" id="catFormTitle">Add Category</span>
        </div>
        <div class="adm-card-body">
          <div class="adm-field">
            <label class="adm-label">Category Name <span>*</span></label>
            <input class="adm-input" id="catNameInput" placeholder="e.g. Commercial RO Plants"/>
          </div>
          <div style="display:flex;gap:12px;">
            <button class="adm-btn adm-btn-secondary" id="catCancelBtn">Cancel</button>
            <button class="adm-btn adm-btn-primary" id="catSaveBtn">${this._ico('save')} Save</button>
          </div>
          <input type="hidden" id="catEditId"/>
        </div>
      </div>
    `;

    el.querySelector('#addCatBtn')?.addEventListener('click', () => {
      el.querySelector('#catFormWrap').style.display = '';
      el.querySelector('#catFormTitle').textContent = 'Add Category';
      el.querySelector('#catNameInput').value = '';
      el.querySelector('#catEditId').value = '';
      el.querySelector('#catNameInput').focus();
    });

    el.querySelector('#catCancelBtn')?.addEventListener('click', () => {
      el.querySelector('#catFormWrap').style.display = 'none';
    });

    el.querySelector('#catSaveBtn')?.addEventListener('click', () => this._saveCat(el));

    this._bindCatActions(el);
  }

  _renderCatList() {
    if (!this.categories.length) return `<p style="color:#64748b;font-size:14px;">No categories yet.</p>`;
    const productCount = cat => this.products.filter(p => p.category === cat).length;
    return `
      <table class="adm-table">
        <thead><tr><th>#</th><th>Name</th><th>ID (Slug)</th><th>Products</th><th>Actions</th></tr></thead>
        <tbody>
          ${this.categories.map((c, i) => `
            <tr>
              <td style="color:#94a3b8;">${i + 1}</td>
              <td style="font-weight:600;">${this._esc(c.name)}</td>
              <td><code style="font-size:12px;color:#64748b;">${this._esc(c.id)}</code></td>
              <td><span class="adm-badge adm-badge-blue">${productCount(c.id)}</span></td>
              <td>
                <div class="adm-tbl-actions">
                  <button class="adm-btn adm-btn-secondary adm-btn-sm adm-btn-icon cat-edit-btn" data-id="${this._esc(c.id)}" data-name="${this._esc(c.name)}" title="Edit">${this._ico('edit')}</button>
                  <button class="adm-btn adm-btn-sm adm-btn-icon cat-delete-btn" style="background:rgba(239,68,68,0.08);color:#ef4444;" data-id="${this._esc(c.id)}" title="Delete">${this._ico('trash')}</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  _bindCatActions(el) {
    el.querySelectorAll('.cat-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        el.querySelector('#catFormWrap').style.display = '';
        el.querySelector('#catFormTitle').textContent = 'Edit Category';
        el.querySelector('#catNameInput').value = btn.dataset.name;
        el.querySelector('#catEditId').value   = btn.dataset.id;
        el.querySelector('#catNameInput').focus();
      });
    });
    el.querySelectorAll('.cat-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete category "${btn.dataset.id}"? Products in it won't be deleted.`)) return;
        const r = await this._api('DELETE', `${API.categories}?id=${encodeURIComponent(btn.dataset.id)}`);
        if (r) {
          await this._loadData();
          this._toast('Category deleted.', 'success');
          this._renderCategories(el);
        }
      });
    });
  }

  async _saveCat(el) {
    const name  = el.querySelector('#catNameInput')?.value.trim();
    const editId = el.querySelector('#catEditId')?.value.trim();
    if (!name) { this._toast('Category name is required.', 'error'); return; }

    let r;
    if (editId) {
      r = await this._api('PUT', `${API.categories}?id=${encodeURIComponent(editId)}`, { name });
    } else {
      r = await this._api('POST', API.categories, { name });
    }
    if (r) {
      await this._loadData();
      this._toast(editId ? 'Category updated!' : 'Category added!', 'success');
      el.querySelector('#catFormWrap').style.display = 'none';
      el.querySelector('#catListWrap').innerHTML = this._renderCatList();
      this._bindCatActions(el);
    }
  }

  /* ======================================================
     Delete modal
  ====================================================== */
  _showDeleteModal(id) {
    this.pendingDeleteId = id;
    this.root.querySelector('#confirmModal')?.classList.add('show');
  }
  _hideModal() {
    this.pendingDeleteId = null;
    this.root.querySelector('#confirmModal')?.classList.remove('show');
  }
  async _doDelete() {
    const id = this.pendingDeleteId;
    this._hideModal();
    if (!id) return;
    const r = await this._api('DELETE', `${API.products}?id=${encodeURIComponent(id)}`);
    if (r) {
      await this._loadData();
      this._toast('Product deleted.', 'success');
      this._showView('products');
    }
  }

  /* ======================================================
     Toast
  ====================================================== */
  _renderToasts() {
    if (document.querySelector('.adm-toast-wrap')) return;
    const w = document.createElement('div');
    w.className = 'adm-toast-wrap';
    document.body.appendChild(w);
    this._toastWrap = w;
  }

  _toast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `adm-toast ${type}`;
    t.innerHTML = `<span class="adm-toast-dot"></span>${this._esc(msg)}`;
    this._toastWrap.appendChild(t);
    requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 400);
    }, 3200);
  }

  _navItem(view, icon, label, count = null) {
    return `
      <div class="adm-nav-item" data-view="${view}">
        ${icon}
        <span>${label}</span>
        ${count != null ? `<span class="adm-nav-badge">${count}</span>` : ''}
      </div>
    `;
  }

  /* ======================================================
     SVG icons
  ====================================================== */
  _ico(name, size = 16) {
    const s = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
    const paths = {
      grid:     '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
      box:      '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
      tag:      '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
      plus:     '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
      edit:     '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
      trash:    '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>',
      save:     '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
      upload:   '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
      x:        '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      search:   '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      logout:   '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
      dollar:   '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
      external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
      empty:    '<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>',
    };
    return `<svg ${s}>${paths[name] ?? ''}</svg>`;
  }

  _esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
