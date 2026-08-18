// API Base Configuration - Route requests to Railway backend when hosting on localhost or Vercel
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') || window.location.origin.includes('vercel.app')
  ? 'https://authentication-production-152b.up.railway.app/api'
  : `${window.location.origin}/api`;

// Application State
let currentUser = null;
let currentPanel = 'users'; // 'users' or 'products'
let usersList = [];
let productsList = [];

// Check Authentication Status on Page Load
document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    setupDashboard();
    showScreen('dashboard-screen');
    loadUsers(); // Default initial panel data
  } else {
    showScreen('auth-screen');
  }
});

/* ═══════════════════ NAVIGATION & UI ═══════════════════ */

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(screenId).classList.remove('hidden');
}

function switchTab(tabType) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
  
  if (tabType === 'login') {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('login-form').classList.remove('hidden');
  } else {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('register-form').classList.remove('hidden');
  }
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPrivate = input.type === 'password';
  input.type = isPrivate ? 'text' : 'password';
  btn.innerHTML = isPrivate
    ? `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

function showPanel(panelName) {
  currentPanel = panelName;
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const createBtnLabel = document.getElementById('create-btn-label');
  const topbarTitle = document.getElementById('topbar-title');
  
  if (panelName === 'users') {
    document.getElementById('users-panel').classList.add('active');
    document.getElementById('nav-users').classList.add('active');
    topbarTitle.textContent = 'Users';
    createBtnLabel.textContent = 'New User';
    loadUsers();
  } else {
    document.getElementById('products-panel').classList.add('active');
    document.getElementById('nav-products').classList.add('active');
    topbarTitle.textContent = 'Products';
    createBtnLabel.textContent = 'New Product';
    loadProducts();
  }
  
  // Close sidebar on mobile after clicking item
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  }
}

function setupDashboard() {
  if (!currentUser) return;
  document.getElementById('sidebar-name').textContent = currentUser.name;
  document.getElementById('sidebar-email').textContent = currentUser.email;
  document.getElementById('sidebar-avatar').textContent = currentUser.name.charAt(0).toUpperCase();
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast'; // reset
  if (type === 'error') {
    toast.style.backgroundColor = 'var(--color-danger)';
  } else {
    toast.style.backgroundColor = 'var(--text-primary)';
  }
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

/* ═══════════════════ AUTHENTICATION ═══════════════════ */

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
  
  errorDiv.classList.add('hidden');
  setLoading(btn, true);
  
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.message || 'Login failed');
    
    currentUser = data.user;
    localStorage.setItem('user', JSON.stringify(currentUser));
    setupDashboard();
    showScreen('dashboard-screen');
    showPanel('users');
    showToast('Logged in successfully');
    
    // Clear form
    document.getElementById('login-form').reset();
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.classList.remove('hidden');
  } finally {
    setLoading(btn, false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const errorDiv = document.getElementById('register-error');
  const btn = document.getElementById('register-btn');
  
  errorDiv.classList.add('hidden');
  setLoading(btn, true);
  
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    
    showToast('Account registered! Please sign in.');
    switchTab('login');
    document.getElementById('login-email').value = email;
    document.getElementById('register-form').reset();
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.classList.remove('hidden');
  } finally {
    setLoading(btn, false);
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('user');
  showScreen('auth-screen');
  showToast('Logged out');
}

/* ═══════════════════ USER CRUD OPERATIONS ═══════════════════ */

async function loadUsers() {
  toggleLoader('users', true);
  try {
    const res = await fetch(`${API_BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to retrieve users');
    usersList = await res.json();
    renderUsers(usersList);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    toggleLoader('users', false);
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('users-tbody');
  const tableWrap = document.getElementById('users-table-wrap');
  const emptyState = document.getElementById('users-empty');
  
  tbody.innerHTML = '';
  
  if (users.length === 0) {
    tableWrap.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  
  tableWrap.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  users.forEach(user => {
    const tr = document.createElement('tr');
    const createdDate = new Date(user.createdAt).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    
    tr.innerHTML = `
      <td>
        <div class="user-cell">
          <div class="user-cell-avatar">${user.name.charAt(0).toUpperCase()}</div>
          <div style="font-weight: 500;">${escapeHTML(user.name)}</div>
        </div>
      </td>
      <td>${escapeHTML(user.email)}</td>
      <td>${createdDate}</td>
      <td class="actions-col">
        <div class="actions-wrap">
          <button class="action-btn" onclick="openEditUserModal('${user._id}')" title="Edit User">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn delete-btn" onclick="confirmDeleteUser('${user._id}', '${escapeJS(user.name)}')" title="Delete User">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterUsers() {
  const query = document.getElementById('users-search').value.toLowerCase();
  const filtered = usersList.filter(user => 
    user.name.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query)
  );
  renderUsers(filtered);
}

async function handleCreateUser(e) {
  e.preventDefault();
  const name = document.getElementById('modal-user-name').value;
  const email = document.getElementById('modal-user-email').value;
  const password = document.getElementById('modal-user-password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  setLoading(submitBtn, true);
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create user');
    
    showToast('User created successfully');
    closeModal();
    loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(submitBtn, false);
  }
}

async function handleUpdateUser(e, id) {
  e.preventDefault();
  const name = document.getElementById('modal-user-name').value;
  const email = document.getElementById('modal-user-email').value;
  const password = document.getElementById('modal-user-password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  const payload = { name, email };
  if (password) payload.password = password; // Only update if specified
  
  setLoading(submitBtn, true);
  try {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update user');
    
    showToast('User updated successfully');
    closeModal();
    
    // If the updated user is the currently logged in user, sync localstorage state
    if (currentUser._id === id) {
      currentUser.name = name;
      currentUser.email = email;
      localStorage.setItem('user', JSON.stringify(currentUser));
      setupDashboard();
    }
    
    loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(submitBtn, false);
  }
}

function confirmDeleteUser(id, name) {
  openConfirm(
    'Delete User',
    `Are you sure you want to delete user <strong>${escapeHTML(name)}</strong>? This action cannot be undone.`,
    async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to delete user');
        
        showToast('User deleted successfully');
        
        // If current user is deleted, force logout
        if (currentUser._id === id) {
          handleLogout();
        } else {
          loadUsers();
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        closeConfirm();
      }
    }
  );
}

/* ═══════════════════ PRODUCT CRUD OPERATIONS ═══════════════════ */

async function loadProducts() {
  toggleLoader('products', true);
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed to retrieve products');
    productsList = await res.json();
    renderProducts(productsList);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    toggleLoader('products', false);
  }
}

function renderProducts(products) {
  const tbody = document.getElementById('products-tbody');
  const tableWrap = document.getElementById('products-table-wrap');
  const emptyState = document.getElementById('products-empty');
  
  tbody.innerHTML = '';
  
  if (products.length === 0) {
    tableWrap.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  
  tableWrap.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  products.forEach(product => {
    const tr = document.createElement('tr');
    const createdDate = new Date(product.createdAt).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    
    // Determine stock warning badge class
    let stockBadgeClass = 'stock-ok';
    let stockStatus = 'In Stock';
    if (product.stock === 0) {
      stockBadgeClass = 'stock-out';
      stockStatus = 'Out of Stock';
    } else if (product.stock <= 5) {
      stockBadgeClass = 'stock-low';
      stockStatus = 'Low Stock';
    }
    
    tr.innerHTML = `
      <td style="font-weight: 600;">${escapeHTML(product.name)}</td>
      <td style="color: var(--text-secondary); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${escapeHTML(product.description)}
      </td>
      <td style="font-family: var(--font-mono); font-weight: 500;">$${parseFloat(product.price).toFixed(2)}</td>
      <td>
        <span class="stock-badge ${stockBadgeClass}">
          ${product.stock} (${stockStatus})
        </span>
      </td>
      <td>${createdDate}</td>
      <td class="actions-col">
        <div class="actions-wrap">
          <button class="action-btn" onclick="openEditProductModal('${product._id}')" title="Edit Product">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn delete-btn" onclick="confirmDeleteProduct('${product._id}', '${escapeJS(product.name)}')" title="Delete Product">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterProducts() {
  const query = document.getElementById('products-search').value.toLowerCase();
  const filtered = productsList.filter(product => 
    product.name.toLowerCase().includes(query) || 
    product.description.toLowerCase().includes(query)
  );
  renderProducts(filtered);
}

async function handleCreateProduct(e) {
  e.preventDefault();
  const name = document.getElementById('modal-prod-name').value;
  const description = document.getElementById('modal-prod-desc').value;
  const price = parseFloat(document.getElementById('modal-prod-price').value);
  const stock = parseInt(document.getElementById('modal-prod-stock').value);
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  setLoading(submitBtn, true);
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price, stock })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create product');
    
    showToast('Product created successfully');
    closeModal();
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(submitBtn, false);
  }
}

async function handleUpdateProduct(e, id) {
  e.preventDefault();
  const name = document.getElementById('modal-prod-name').value;
  const description = document.getElementById('modal-prod-desc').value;
  const price = parseFloat(document.getElementById('modal-prod-price').value);
  const stock = parseInt(document.getElementById('modal-prod-stock').value);
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  setLoading(submitBtn, true);
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, price, stock })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update product');
    
    showToast('Product updated successfully');
    closeModal();
    loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setLoading(submitBtn, false);
  }
}

function confirmDeleteProduct(id, name) {
  openConfirm(
    'Delete Product',
    `Are you sure you want to delete product <strong>${escapeHTML(name)}</strong>? This action cannot be undone.`,
    async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to delete product');
        
        showToast('Product deleted successfully');
        loadProducts();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        closeConfirm();
      }
    }
  );
}

/* ═══════════════════ MODALS & DIALOGS ═══════════════════ */

function openCreateModal() {
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const footer = document.getElementById('modal-footer');
  
  if (currentPanel === 'users') {
    title.textContent = 'Create New User';
    body.innerHTML = `
      <form id="modal-form" onsubmit="handleCreateUser(event)">
        <div class="form-group">
          <label for="modal-user-name">Full Name</label>
          <input id="modal-user-name" type="text" required placeholder="Full Name" />
        </div>
        <div class="form-group">
          <label for="modal-user-email">Email Address</label>
          <input id="modal-user-email" type="email" required placeholder="name@domain.com" />
        </div>
        <div class="form-group">
          <label for="modal-user-password">Password</label>
          <div class="input-with-toggle">
            <input id="modal-user-password" type="password" required placeholder="Secure Password" />
            <button type="button" class="eye-btn" onclick="togglePassword('modal-user-password', this)">
              <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
      </form>
    `;
    footer.innerHTML = `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" type="submit" form="modal-form">
        <span class="btn-text">Create User</span>
        <span class="btn-spinner hidden"></span>
      </button>
    `;
  } else {
    title.textContent = 'Create New Product';
    body.innerHTML = `
      <form id="modal-form" onsubmit="handleCreateProduct(event)">
        <div class="form-group">
          <label for="modal-prod-name">Product Name</label>
          <input id="modal-prod-name" type="text" required placeholder="Product Name" />
        </div>
        <div class="form-group">
          <label for="modal-prod-desc">Description</label>
          <textarea id="modal-prod-desc" required placeholder="Product description..." rows="3"></textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label for="modal-prod-price">Price ($)</label>
            <input id="modal-prod-price" type="number" step="0.01" min="0" required placeholder="0.00" />
          </div>
          <div class="form-group">
            <label for="modal-prod-stock">Stock Quantity</label>
            <input id="modal-prod-stock" type="number" min="0" required placeholder="0" />
          </div>
        </div>
      </form>
    `;
    footer.innerHTML = `
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" type="submit" form="modal-form">
        <span class="btn-text">Create Product</span>
        <span class="btn-spinner hidden"></span>
      </button>
    `;
  }
  
  overlay.classList.remove('hidden');
}

function openEditUserModal(id) {
  const user = usersList.find(u => u._id === id);
  if (!user) return;
  
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const footer = document.getElementById('modal-footer');
  
  title.textContent = 'Edit User Settings';
  body.innerHTML = `
    <form id="modal-form" onsubmit="handleUpdateUser(event, '${id}')">
      <div class="form-group">
        <label for="modal-user-name">Full Name</label>
        <input id="modal-user-name" type="text" required value="${escapeHTML(user.name)}" />
      </div>
      <div class="form-group">
        <label for="modal-user-email">Email Address</label>
        <input id="modal-user-email" type="email" required value="${escapeHTML(user.email)}" />
      </div>
      <div class="form-group">
        <label for="modal-user-password">New Password (Leave blank to keep current)</label>
        <div class="input-with-toggle">
          <input id="modal-user-password" type="password" placeholder="Change password" />
          <button type="button" class="eye-btn" onclick="togglePassword('modal-user-password', this)">
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>
    </form>
  `;
  footer.innerHTML = `
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" type="submit" form="modal-form">
      <span class="btn-text">Save Changes</span>
      <span class="btn-spinner hidden"></span>
    </button>
  `;
  
  overlay.classList.remove('hidden');
}

function openEditProductModal(id) {
  const product = productsList.find(p => p._id === id);
  if (!product) return;
  
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const footer = document.getElementById('modal-footer');
  
  title.textContent = 'Edit Product Details';
  body.innerHTML = `
    <form id="modal-form" onsubmit="handleUpdateProduct(event, '${id}')">
      <div class="form-group">
        <label for="modal-prod-name">Product Name</label>
        <input id="modal-prod-name" type="text" required value="${escapeHTML(product.name)}" />
      </div>
      <div class="form-group">
        <label for="modal-prod-desc">Description</label>
        <textarea id="modal-prod-desc" required rows="3">${escapeHTML(product.description)}</textarea>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="form-group">
          <label for="modal-prod-price">Price ($)</label>
          <input id="modal-prod-price" type="number" step="0.01" min="0" required value="${product.price}" />
        </div>
        <div class="form-group">
          <label for="modal-prod-stock">Stock Quantity</label>
          <input id="modal-prod-stock" type="number" min="0" required value="${product.stock}" />
        </div>
      </div>
    </form>
  `;
  footer.innerHTML = `
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" type="submit" form="modal-form">
      <span class="btn-text">Save Changes</span>
      <span class="btn-spinner hidden"></span>
    </button>
  `;
  
  overlay.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-body').innerHTML = '';
}

function closeModalOnOverlay(e) {
  if (e.target.id === 'modal-overlay') closeModal();
}

// Confirmation Dialog Logic
let confirmCallback = null;

function openConfirm(title, message, callback) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').innerHTML = message;
  confirmCallback = callback;
  
  const actionBtn = document.getElementById('confirm-action-btn');
  // Recreate button to clear old event listeners
  const newActionBtn = actionBtn.cloneNode(true);
  newActionBtn.addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
  });
  actionBtn.parentNode.replaceChild(newActionBtn, actionBtn);
  
  document.getElementById('confirm-overlay').classList.remove('hidden');
}

function closeConfirm() {
  document.getElementById('confirm-overlay').classList.add('hidden');
  confirmCallback = null;
}

function closeConfirmOnOverlay(e) {
  if (e.target.id === 'confirm-overlay') closeConfirm();
}

/* ═══════════════════ UTILITIES & HELPERS ═══════════════════ */

function setLoading(button, isLoading) {
  if (!button) return;
  const text = button.querySelector('.btn-text');
  const spinner = button.querySelector('.btn-spinner');
  
  if (isLoading) {
    button.disabled = true;
    if (text) text.classList.add('hidden');
    if (spinner) spinner.classList.remove('hidden');
  } else {
    button.disabled = false;
    if (text) text.classList.remove('hidden');
    if (spinner) spinner.classList.add('hidden');
  }
}

function toggleLoader(panelName, show) {
  const loader = document.getElementById(`${panelName}-loader`);
  const table = document.getElementById(`${panelName}-table-wrap`);
  const empty = document.getElementById(`${panelName}-empty`);
  
  if (show) {
    loader.classList.remove('hidden');
    table.classList.add('hidden');
    empty.classList.add('hidden');
  } else {
    loader.classList.add('hidden');
  }
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJS(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
