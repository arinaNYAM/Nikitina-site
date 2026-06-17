/* ФАЙЛ: script.js */

// ===== PRODUCTS DATA (только 3 букета из каталога) =====
const products = [
  { id: 1, name: 'Нежность', price: 7990, img: 'flowers/nejnost.png', liked: false },
  { id: 2, name: 'Облако',   price: 4900, img: 'flowers/oblako.png',  liked: false },
  { id: 3, name: 'Мечта',    price: 2690, img: 'flowers/mechta.png',  liked: false },
];

let cart = [];
let currentModalProduct = null;

// ===== PAGE NAVIGATION =====
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (page === 'login') {
    document.getElementById('loginPage').classList.add('active');
  } else if (page === 'catalog') {
    document.getElementById('catalogPage').classList.add('active');
    renderProducts(products);
  } else {
    document.getElementById('mainPage').classList.add('active');
  }
  window.scrollTo(0, 0);
}

function goToMain() {
  showPage('catalog');
}

// ===== LOGIN =====
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`);
  if (btn) btn.classList.add('active');
  document.getElementById('loginForm').style.display  = tab === 'login'    ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

function togglePassword() {
  const f = document.getElementById('passwordField');
  f.type = f.type === 'password' ? 'text' : 'password';
}

// ===== RENDER PRODUCTS =====
function renderProducts(list) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  if (list.length === 0) {
    grid.innerHTML = '<p style="color:#aaa;padding:20px;grid-column:1/-1;">Нет товаров по выбранным фильтрам</p>';
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="product-card" id="card-${p.id}">
      <img src="${p.img}" alt="${p.name}">
      <div class="product-info">
        <div class="product-title-row">
          <span class="product-name">${p.name}</span>
          <button class="heart-btn ${p.liked ? 'liked' : ''}" onclick="toggleLike(${p.id})" title="В избранное">♥</button>
        </div>
        <div class="product-price">${p.price.toLocaleString('ru')} ₽</div>
        <button class="btn-detail" onclick="openProductModal(${p.id})">Подробнее</button>
      </div>
    </div>
  `).join('');
}

// ===== PRODUCT DETAIL MODAL =====
function openProductModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentModalProduct = p;
  document.getElementById('modalImg').src   = p.img;
  document.getElementById('modalImg').alt   = p.name;
  document.getElementById('modalName').textContent  = p.name;
  document.getElementById('modalPrice').textContent = p.price.toLocaleString('ru') + ' ₽';
  document.getElementById('productModal').classList.add('open');
  // При клике на кнопку — алерт (открытие окна — тоже действие по кнопке)
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
  currentModalProduct = null;
}

function addModalToCart() {
  if (!currentModalProduct) return;
  addToCart(currentModalProduct.id);
  closeProductModal();
}

// ===== LIKE =====
function toggleLike(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  p.liked = !p.liked;
  const btn = document.querySelector(`#card-${id} .heart-btn`);
  if (btn) btn.classList.toggle('liked', p.liked);
  showAlert(p.liked ? '❤️ Добавлено в избранное' : '🤍 Убрано из избранного');
}

// ===== CART =====
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(x => x.id === id);
  if (existing) { existing.qty++; } else { cart.push({ ...p, qty: 1 }); }
  showAlert(`🌸 «${p.name}» добавлен в корзину`);
}

function showCart() {
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
    totalEl.innerHTML = '';
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <span>${item.name} × ${item.qty}</span>
        <span>${(item.price * item.qty).toLocaleString('ru')} ₽
          <span class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</span>
        </span>
      </div>
    `).join('');
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    totalEl.innerHTML = `Итого: ${total.toLocaleString('ru')} ₽`;
  }
  document.getElementById('cartModal').classList.add('open');
}

function hideCart() {
  document.getElementById('cartModal').classList.remove('open');
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  showCart();
}

function checkout() {
  if (cart.length === 0) { showAlert('Корзина пуста!'); return; }
  cart = [];
  hideCart();
  showAlert('✅ Заказ оформлен! Спасибо за покупку!');
}

// ===== FILTERS =====
function filterTag(btn, tag) {
  document.querySelectorAll('.filter-tags .tag').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function applyFilters() {
  const minPrice = parseInt(document.getElementById('priceMin')?.value || 0);
  const maxPrice = parseInt(document.getElementById('priceMax')?.value || 999999);
  const sortVal  = document.querySelector('input[name="sort"]:checked')?.value || 'new';

  let filtered = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

  if (sortVal === 'cheap')     filtered.sort((a, b) => a.price - b.price);
  else if (sortVal === 'expensive') filtered.sort((a, b) => b.price - a.price);

  renderProducts(filtered);
}

// ===== ALERT =====
function showAlert(msg) {
  const box = document.getElementById('alertBox');
  box.textContent = msg;
  box.style.display = 'block';
  clearTimeout(box._timer);
  box._timer = setTimeout(() => { box.style.display = 'none'; }, 2500);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  showPage('login');
});