// =============================================
// Основная логика приложения
// =============================================

let currentCategory = 'all';
let currentLogFilter = 'all';

// =============================================
// Инициализация
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  renderCatalog();
  renderCart();
  renderStock();
  renderLogs();
  renderStats();
  updateCartBadge();
  renderMiniCart();
});

// =============================================
// Навигация
// =============================================
function switchTab(tab) {
  // Скрываем все страницы
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Показываем нужную
  document.getElementById(`page-${tab}`).classList.add('active');
  
  // Обновляем табы
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');
  
  // Обновляем заголовок
  const titles = {
    catalog: 'Каталог',
    cart: 'Корзина',
    stock: 'Склад',
    logs: 'Логи',
    stats: 'Статистика'
  };
  document.getElementById('page-title').textContent = titles[tab];
  
  // Перерисовываем контент при переключении
  if (tab === 'cart') renderCart();
  if (tab === 'stock') renderStock();
  if (tab === 'logs') renderLogs();
  if (tab === 'stats') renderStats();
  if (tab === 'catalog') renderMiniCart();
}

// =============================================
// Каталог
// =============================================
function renderCatalog() {
  renderCategories();
  renderProducts();
}

function renderCategories() {
  const container = document.getElementById('categories');
  let html = `<button class="cat-btn ${currentCategory === 'all' ? 'active' : ''}" onclick="filterCategory('all')">Все</button>`;
  
  CATEGORIES.forEach(cat => {
    html += `<button class="cat-btn ${currentCategory === cat.id ? 'active' : ''}" onclick="filterCategory('${cat.id}')">${cat.icon} ${cat.name}</button>`;
  });
  
  container.innerHTML = html;
}

function filterCategory(categoryId) {
  currentCategory = categoryId;
  renderCategories();
  renderProducts();
}

function productImg(product, className = 'product-img') {
  if (product.image) {
    return `<div class="${className}"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>`;
  }
  return `<div class="${className}">📦</div>`;
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  const stock = DB.getStock();
  const cart = DB.getCart();

  let products = PRODUCTS;
  if (currentCategory !== 'all') {
    products = products.filter(p => p.categoryId === currentCategory);
  }

  if (products.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-dim);">Нет товаров</div>';
    return;
  }

  let html = '';
  products.forEach(product => {
    const stockQty = stock[product.id] || 0;
    const cartQty = cart[product.id] || 0;
    const outOfStock = stockQty === 0;
    const priceText = product.price === 0 ? 'Бесплатно' : formatPrice(product.price);

    html += `
      <div class="product-card ${outOfStock ? 'out-of-stock' : ''}">
        <div class="product-img-wrapper" onclick="addToCartFromCatalog(${product.id})">
          ${productImg(product)}
        </div>
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-price">${priceText}</div>
          <div class="product-stock">${outOfStock ? 'Нет в наличии' : `В наличии: ${stockQty}`}</div>
          ${cartQty > 0 ? `
            <div class="product-cart-controls">
              <button class="qty-btn-sm minus" onclick="removeFromCartCatalog(${product.id})">−</button>
              <span class="qty-display">${cartQty}</span>
              <button class="qty-btn-sm plus" onclick="addToCartFromCatalog(${product.id})">+</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function addToCartFromCatalog(productId) {
  const stock = DB.getStock();
  const cart = DB.getCart();
  const stockQty = stock[productId] || 0;
  const cartQty = cart[productId] || 0;

  if (cartQty >= stockQty) {
    showToast('Нет в наличии', 'error');
    return;
  }

  DB.addToCart(productId, 1);
  updateCartBadge();
  renderProducts();
  renderMiniCart();
}

function removeFromCartCatalog(productId) {
  DB.removeFromCart(productId, 1);
  updateCartBadge();
  renderProducts();
  renderMiniCart();
}

// =============================================
// Модалка товара
// =============================================
function showProductDetail(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const stock = DB.getStock();
  const qty = stock[productId] || 0;
  const priceText = product.price === 0 ? 'Бесплатно' : formatPrice(product.price);

  const content = `
    ${productImg(product, 'modal-product-img')}
    <div class="modal-product-name">${product.name}</div>
    <div class="modal-product-price">${priceText}</div>
    <div class="modal-product-stock">В наличии: ${qty} шт.</div>

    <div class="modal-actions">
      <button class="btn btn-primary" onclick="addToCartFromModal(${productId})" ${qty === 0 ? 'disabled' : ''}>
        В корзину
      </button>
      <button class="btn btn-secondary" onclick="showRestockModal(${productId})">
        Пополнить
      </button>
    </div>
  `;

  openModal(content);
}

function addToCartFromModal(productId) {
  const stock = DB.getStock();
  const qty = stock[productId] || 0;

  if (qty === 0) {
    showToast('Нет в наличии', 'error');
    return;
  }

  DB.addToCart(productId, 1);
  updateCartBadge();
  renderMiniCart();
  closeModal();
  showToast('Добавлено в корзину', 'success');
}

function showRestockModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const content = `
    <h2>Пополнить: ${product.name}</h2>
    <div class="number-input">
      <button class="qty-btn" onclick="changeRestockQty(-1)">−</button>
      <input type="number" id="restock-qty" value="1" min="1">
      <button class="qty-btn" onclick="changeRestockQty(1)">+</button>
    </div>
    <div class="modal-actions">
      <button class="btn btn-success" onclick="restockProduct(${productId})">Пополнить</button>
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
    </div>
  `;
  
  openModal(content);
}

function changeRestockQty(delta) {
  const input = document.getElementById('restock-qty');
  const val = parseInt(input.value) || 1;
  input.value = Math.max(1, val + delta);
}

function restockProduct(productId) {
  const qty = parseInt(document.getElementById('restock-qty').value) || 1;
  const product = PRODUCTS.find(p => p.id === productId);
  
  DB.addStock(productId, qty);
  DB.addLog({
    type: 'stock',
    action: 'restock',
    productId: productId,
    productName: product.name,
    quantity: qty
  });
  
  closeModal();
  renderCatalog();
  renderStock();
  showToast(`Пополнено: ${product.name} (+${qty})`, 'success');
}

// =============================================
// Корзина
// =============================================
function renderCart() {
  const cart = DB.getCart();
  const itemsContainer = document.getElementById('cart-items');
  const promosContainer = document.getElementById('cart-promos');
  const totalContainer = document.getElementById('cart-total');
  
  const cartItems = Object.entries(cart).map(([productId, qty]) => {
    const product = PRODUCTS.find(p => p.id === parseInt(productId));
    return { product, qty };
  }).filter(item => item.product);
  
  if (cartItems.length === 0) {
    itemsContainer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div class="cart-empty-text">Корзина пуста</div>
      </div>
    `;
    promosContainer.innerHTML = '';
    totalContainer.innerHTML = '';
    return;
  }
  
  // Рендер товаров
  let itemsHtml = '';
  cartItems.forEach(({ product, qty }) => {
    const itemTotal = product.price * qty;
    const imgHtml = product.image
      ? `<img src="${product.image}" alt="${product.name}" class="cart-item-img">`
      : `<span class="cart-item-emoji-fallback">📦</span>`;
    itemsHtml += `
      <div class="cart-item">
        <div class="cart-item-thumb">${imgHtml}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">${formatPrice(product.price)} × ${qty}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn danger" onclick="removeFromCart(${product.id})">−</button>
          <span class="qty-value">${qty}</span>
          <button class="qty-btn" onclick="addToCart(${product.id})">+</button>
        </div>
        <div class="cart-item-total">${formatPrice(itemTotal)}</div>
      </div>
    `;
  });
  itemsContainer.innerHTML = itemsHtml;
  
  // Применяем акции
  const { subtotal, discounts, gifts, total } = calculateCartTotals(cartItems);
  
  // Рендер промо
  let promosHtml = '';
  discounts.forEach(d => {
    const countText = d.count > 1 ? ` (×${d.count})` : '';
    promosHtml += `<div class="promo-line discount">🎁 ${d.name}${countText}: −${formatPrice(d.amount)}</div>`;
  });
  gifts.forEach(g => {
    promosHtml += `<div class="promo-line gift">🎁 ${g.name}: ${g.productName} в подарок</div>`;
  });
  promosContainer.innerHTML = promosHtml;
  
  // Рендер итогов
  let totalHtml = `
    <div class="cart-total-row">
      <span class="label">Товары (${cartItems.reduce((sum, i) => sum + i.qty, 0)} шт.)</span>
      <span class="value">${formatPrice(subtotal)}</span>
    </div>
  `;
  
  if (discounts.length > 0) {
    const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
    totalHtml += `
      <div class="cart-total-row">
        <span class="label">Скидки</span>
        <span class="value" style="color: var(--success);">−${formatPrice(totalDiscount)}</span>
      </div>
    `;
  }
  
  totalHtml += `
    <div class="cart-total-row grand">
      <span class="label">Итого</span>
      <span class="value">${formatPrice(total)}</span>
    </div>
  `;
  
  totalContainer.innerHTML = totalHtml;
}

function calculateCartTotals(cartItems) {
  let subtotal = 0;
  cartItems.forEach(({ product, qty }) => {
    subtotal += product.price * qty;
  });

  const discounts = [];
  const gifts = [];

  // Проверяем акции типа product_set
  PROMOTIONS.forEach(promo => {
    if (promo.type === 'product_set') {
      // Находим минимальное количество среди товаров набора
      const quantities = promo.requiredProductIds.map(id => {
        const item = cartItems.find(item => item.product.id === id);
        return item ? item.qty : 0;
      });
      
      const setCount = Math.min(...quantities);
      
      if (setCount > 0) {
        discounts.push({
          name: promo.name,
          amount: promo.discount * setCount,
          count: setCount
        });
      }
    }
  });

  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
  const total = Math.max(0, subtotal - totalDiscount);

  return { subtotal, discounts, gifts, total };
}

function addToCart(productId) {
  const stock = DB.getStock();
  const cart = DB.getCart();
  const currentQty = cart[productId] || 0;
  const availableQty = stock[productId] || 0;

  if (currentQty >= availableQty) {
    showToast('Нет в наличии', 'error');
    return;
  }

  DB.addToCart(productId, 1);
  updateCartBadge();
  renderCart();
  renderMiniCart();
}

function removeFromCart(productId) {
  DB.removeFromCart(productId, 1);
  updateCartBadge();
  renderCart();
  renderMiniCart();
}

function confirmClearCart() {
  const content = `
    <h2>Очистить корзину?</h2>
    <p style="color: var(--text-dim); margin-bottom: 20px;">Все товары будут удалены из корзины</p>
    <div class="modal-actions">
      <button class="btn btn-danger" onclick="clearCart(); closeModal();">Очистить</button>
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
    </div>
  `;
  openModal(content);
}

function clearCart() {
  DB.clearCart();
  updateCartBadge();
  renderCart();
  renderMiniCart();
  showToast('Корзина очищена');
}

function confirmClearStock() {
  const content = `
    <h2>Очистить склад?</h2>
    <p style="color: var(--text-dim); margin-bottom: 20px;">Все остатки товаров будут обнулены</p>
    <div class="modal-actions">
      <button class="btn btn-danger" onclick="clearStock(); closeModal();">Очистить</button>
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
    </div>
  `;
  openModal(content);
}

function clearStock() {
  DB.clearStock();
  renderStock();
  renderCatalog();
  showToast('Склад очищен');
}

function confirmClearLogs() {
  const content = `
    <h2>Очистить логи?</h2>
    <p style="color: var(--text-dim); margin-bottom: 20px;">Все логи продаж, возвратов и склада будут удалены</p>
    <div class="modal-actions">
      <button class="btn btn-danger" onclick="clearLogs(); closeModal();">Очистить</button>
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
    </div>
  `;
  openModal(content);
}

function clearLogs() {
  DB.clearLogs();
  renderLogs();
  renderStats();
  showToast('Логи очищены');
}

function confirmSale() {
  const cart = DB.getCart();
  const cartItems = Object.entries(cart).map(([productId, qty]) => {
    const product = PRODUCTS.find(p => p.id === parseInt(productId));
    return { product, qty };
  }).filter(item => item.product);

  if (cartItems.length === 0) {
    showToast('Корзина пуста', 'error');
    return;
  }

  const { subtotal, discounts, gifts, total } = calculateCartTotals(cartItems);
  
  let itemsList = cartItems.map(({ product, qty }) => 
    `<div style="display: flex; justify-content: space-between; padding: 4px 0;">
      <span>${product.name} × ${qty}</span>
      <span>${formatPrice(product.price * qty)}</span>
    </div>`
  ).join('');

  if (discounts.length > 0) {
    itemsList += `<div style="display: flex; justify-content: space-between; padding: 4px 0; color: var(--success);">
      <span>Скидки</span>
      <span>−${formatPrice(discounts.reduce((sum, d) => sum + d.amount, 0))}</span>
    </div>`;
  }

  if (gifts.length > 0) {
    itemsList += `<div style="display: flex; justify-content: space-between; padding: 4px 0; color: var(--warning);">
      <span>Подарки</span>
      <span>${gifts.map(g => g.productName).join(', ')}</span>
    </div>`;
  }

  itemsList += `<div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 8px; border-top: 2px solid var(--surface3); font-size: 18px; font-weight: 700;">
    <span>Итого</span>
    <span style="color: var(--success);">${formatPrice(total)}</span>
  </div>`;

  const content = `
    <h2>Подтвердить продажу?</h2>
    <div style="margin-bottom: 20px; max-height: 300px; overflow-y: auto;">
      ${itemsList}
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" onclick="completeSale(); closeModal();">Продать</button>
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
    </div>
  `;
  openModal(content);
}

function completeSale() {
  const cart = DB.getCart();
  const cartItems = Object.entries(cart).map(([productId, qty]) => {
    const product = PRODUCTS.find(p => p.id === parseInt(productId));
    return { product, qty };
  }).filter(item => item.product);
  
  if (cartItems.length === 0) {
    showToast('Корзина пуста', 'error');
    return;
  }
  
  // Проверяем остатки
  const stock = DB.getStock();
  const unavailable = cartItems.filter(({ product, qty }) => {
    return (stock[product.id] || 0) < qty;
  });
  
  if (unavailable.length > 0) {
    const names = unavailable.map(i => i.product.name).join(', ');
    showToast(`Недостаточно: ${names}`, 'error');
    return;
  }
  
  // Рассчитываем итоги
  const { subtotal, discounts, gifts, total } = calculateCartTotals(cartItems);
  
  // Списываем со склада
  cartItems.forEach(({ product, qty }) => {
    DB.removeStock(product.id, qty);
  });
  
  // Добавляем подарки на склад (они же не из воздуха)
  gifts.forEach(gift => {
    // Подарки не списываем со склада, они идут отдельно
  });
  
  // Создаём запись о продаже
  const sale = {
    items: cartItems.map(({ product, qty }) => ({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: qty,
      total: product.price * qty
    })),
    subtotal: subtotal,
    discounts: discounts,
    gifts: gifts,
    total: total
  };

  const savedSale = DB.addSale(sale);

  // Логируем
  DB.addLog({
    type: 'sale',
    saleId: savedSale.id,
    items: sale.items,
    subtotal: sale.subtotal,
    discounts: sale.discounts,
    gifts: sale.gifts,
    total: sale.total
  });
  
  // Очищаем корзину
  DB.clearCart();
  updateCartBadge();
  renderCart();
  renderMiniCart();
  renderCatalog();
  renderStock();

  showToast(`Продажа: ${formatPrice(total)}`, 'success');
}

function updateCartBadge() {
  const cart = DB.getCart();
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const badge = document.getElementById('cart-badge');
  const countEl = document.getElementById('cart-count');

  if (!badge || !countEl) return;

  if (count > 0) {
    badge.classList.remove('hidden');
    countEl.textContent = count;
  } else {
    badge.classList.add('hidden');
  }
}

function renderMiniCart() {
  const container = document.getElementById('mini-cart-items');
  const totalContainer = document.getElementById('mini-cart-total');
  if (!container || !totalContainer) return;

  const cart = DB.getCart();
  const cartItems = Object.entries(cart).map(([productId, qty]) => {
    const product = PRODUCTS.find(p => p.id === parseInt(productId));
    return { product, qty };
  }).filter(item => item.product);

  if (cartItems.length === 0) {
    container.innerHTML = '<div class="mini-cart-empty">Пусто</div>';
    totalContainer.innerHTML = '';
    return;
  }

  let html = '';
  cartItems.forEach(({ product, qty }) => {
    const itemTotal = product.price * qty;
    html += `
      <div class="mini-cart-item">
        <span class="mini-cart-item-name">${product.name}</span>
        <span class="mini-cart-item-qty">×${qty}</span>
        <span class="mini-cart-item-price">${formatPrice(itemTotal)}</span>
      </div>
    `;
  });
  container.innerHTML = html;

  // Рассчитываем итоги с учетом скидок
  const { total, discounts } = calculateCartTotals(cartItems);
  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);

  let totalHtml = `
    <span class="label">Итого</span>
    <span class="value">${formatPrice(total)}</span>
  `;

  if (totalDiscount > 0) {
    totalHtml = `
      <div style="font-size: 11px; color: var(--text-dim); margin-bottom: 4px;">
        Скидка: −${formatPrice(totalDiscount)}
      </div>
      ${totalHtml}
    `;
  }

  totalContainer.innerHTML = totalHtml;
}

// =============================================
// Склад
// =============================================
function renderStockCategories() {
  const container = document.getElementById('stock-categories');
  if (!container) return;
  
  let html = `<button class="cat-btn ${currentCategory === 'all' ? 'active' : ''}" onclick="filterCategory('all')">Все</button>`;

  CATEGORIES.forEach(cat => {
    html += `<button class="cat-btn ${currentCategory === cat.id ? 'active' : ''}" onclick="filterCategory('${cat.id}')">${cat.icon} ${cat.name}</button>`;
  });

  container.innerHTML = html;
}

function renderStock() {
  const stock = DB.getStock();
  const container = document.getElementById('stock-list');

  renderStockCategories();
  
  let products = PRODUCTS;
  if (currentCategory !== 'all') {
    products = products.filter(p => p.categoryId === currentCategory);
  }
  
  if (products.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-dim);">Нет товаров</div>';
    return;
  }
  
  let html = '';
  products.forEach(product => {
    const qty = stock[product.id] || 0;
    const qtyClass = qty === 0 ? 'zero' : qty < 5 ? 'low' : '';
    const imgHtml = product.image
      ? `<img src="${product.image}" alt="${product.name}" class="stock-item-img">`
      : `<span class="stock-item-emoji-fallback">📦</span>`;

    html += `
      <div class="stock-item">
        <div class="stock-item-thumb">${imgHtml}</div>
        <div class="stock-item-info">
          <div class="stock-item-name">${product.name}</div>
          <div class="stock-item-price">${formatPrice(product.price)}</div>
        </div>
        <div class="stock-item-qty">
          <span class="stock-qty-value ${qtyClass}">${qty}</span>
        </div>
        <div class="stock-actions">
          <button class="stock-btn remove" onclick="updateStock(${product.id}, -1)" ${qty === 0 ? 'disabled' : ''}>−</button>
          <button class="stock-btn add" onclick="updateStock(${product.id}, 1)">+</button>
          <button class="stock-btn add" onclick="updateStock(${product.id}, 10)">+10</button>
          <button class="stock-btn cart-add" onclick="addToCartFromStock(${product.id})" ${qty === 0 ? 'disabled' : ''}>🛒</button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function updateStock(productId, delta) {
  const product = PRODUCTS.find(p => p.id === productId);
  const stock = DB.getStock();
  const currentQty = stock[productId] || 0;
  
  if (delta < 0 && currentQty === 0) return;
  
  DB.addStock(productId, delta);
  
    DB.addLog({
    type: 'stock',
    action: delta > 0 ? 'restock' : 'remove',
    productId: productId,
    productName: product.name,
    quantity: Math.abs(delta)
  });
  
  renderStock();
  renderCatalog();
  showToast(`${product.name}: ${delta > 0 ? '+' : ''}${delta}`, delta > 0 ? 'success' : 'error');
}

function addToCartFromStock(productId) {
  const stock = DB.getStock();
  const qty = stock[productId] || 0;

  if (qty === 0) {
    showToast('Нет в наличии', 'error');
    return;
  }

  DB.addToCart(productId, 1);
  updateCartBadge();
  renderMiniCart();
  showToast('Добавлено в корзину', 'success');
}

// =============================================
// Логи
// =============================================
function renderLogs() {
  const logs = DB.getLogs();
  const container = document.getElementById('logs-list');
  
  let filtered = logs;
  if (currentLogFilter !== 'all') {
    filtered = logs.filter(l => l.type === currentLogFilter);
  }
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="logs-empty">Нет записей</div>';
    return;
  }
  
  let html = '';
  filtered.forEach(log => {
    const time = formatTime(log.timestamp);
    
    let detailsHtml = '';
    
    if (log.type === 'sale' || log.type === 'return') {
      if (log.items) {
        detailsHtml = log.items.map(item => 
          `<div class="item-line"><span>${item.productName} × ${item.quantity}</span><span>${formatPrice(item.total || item.price * item.quantity)}</span></div>`
        ).join('');
      }
      if (log.discounts && log.discounts.length > 0) {
        detailsHtml += log.discounts.map(d => 
          `<div class="item-line" style="color: var(--success);"><span>${d.name}</span><span>−${formatPrice(d.amount)}</span></div>`
        ).join('');
      }
      if (log.gifts && log.gifts.length > 0) {
        detailsHtml += log.gifts.map(g => 
          `<div class="item-line" style="color: var(--warning);"><span>🎁 ${g.productName}</span><span>подарок</span></div>`
        ).join('');
      }
      detailsHtml += `<div class="log-summary">Итого: ${formatPrice(log.total)}</div>`;
    } else if (log.type === 'stock') {
      const actionText = log.action === 'restock' ? 'Пополнение' : 'Удаление';
      detailsHtml = `${actionText}: ${log.productName} (${log.action === 'restock' ? '+' : '−'}${log.quantity} шт.)`;
    }
    
    const typeLabels = { sale: 'Продажа', return: 'Возврат', stock: 'Склад' };
    
    html += `
      <div class="log-entry ${log.type}">
        <div class="log-header">
          <span class="log-type ${log.type}">${typeLabels[log.type] || log.type}</span>
          <span class="log-time">${time}</span>
        </div>
        <div class="log-details">${detailsHtml}</div>
        ${log.type === 'sale' && log.saleId ? `<button class="btn btn-danger" style="margin-top: 10px; width: 100%; padding: 10px;" onclick="showReturnModal('${log.saleId}')">↩️ Возврат</button>` : ''}
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function filterLogs(filter) {
  currentLogFilter = filter;
  
  document.querySelectorAll('.logs-filters .filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  renderLogs();
}

// =============================================
// Возврат
// =============================================
function showReturnModal(saleId) {
  const sales = DB.getSales();
  const sale = sales.find(s => s.id === saleId);
  
  if (!sale) {
    showToast('Продажа не найдена', 'error');
    return;
  }
  
  let itemsHtml = sale.items.map((item, idx) => `
    <div class="return-item">
      <div class="return-item-info">
        <div class="return-item-name">${item.productName}</div>
        <div class="return-item-price">${formatPrice(item.price)} × ${item.quantity}</div>
      </div>
      <label style="display: flex; align-items: center; gap: 8px;">
        <input type="checkbox" id="return-check-${idx}" checked>
        <span>Вернуть</span>
      </label>
    </div>
  `).join('');
  
  const content = `
    <h2>↩️ Возврат</h2>
    <div class="modal-actions" style="margin-bottom: 16px;">
      <button class="btn btn-danger" onclick="processReturn('${saleId}')">Вернуть</button>
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
    </div>
    <p style="color: var(--text-dim); margin-bottom: 8px;">Выберите товары для возврата</p>
    ${itemsHtml}
  `;
  
  openModal(content);
}

function processReturn(saleId) {
  const sales = DB.getSales();
  const sale = sales.find(s => s.id === saleId);

  if (!sale) {
    showToast('Продажа не найдена', 'error');
    return;
  }

  const returnItems = [];

  sale.items.forEach((item, idx) => {
    const checkbox = document.getElementById(`return-check-${idx}`);
    if (checkbox && checkbox.checked) {
      returnItems.push({ ...item });
      // Возвращаем на склад
      DB.addStock(item.productId, item.quantity);
    }
  });

  if (returnItems.length === 0) {
    showToast('Ничего не выбрано', 'error');
    return;
  }

  // Рассчитываем сумму возврата с учетом скидок
  const returnTotal = calculateReturnTotal(sale, returnItems);

  // Логируем возврат
  DB.addLog({
    type: 'return',
    saleId: saleId,
    items: returnItems,
    total: returnTotal,
    discounts: sale.discounts || []
  });

  closeModal();
  renderLogs();
  renderCatalog();
  renderStock();
  showToast(`Возврат: ${formatPrice(returnTotal)}`, 'success');
}

function calculateReturnTotal(sale, returnItems) {
  // Сумма возвращаемых товаров по обычным ценам
  const returnSubtotal = returnItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  if (!sale.discounts || sale.discounts.length === 0) {
    return returnSubtotal;
  }

  // Создаем карту оставшихся товаров после возврата
  const remainingItems = {};
  sale.items.forEach(item => {
    remainingItems[item.productId] = item.quantity;
  });
  
  returnItems.forEach(item => {
    remainingItems[item.productId] -= item.quantity;
  });

  // Рассчитываем, какие скидки теряются при возврате
  let lostDiscount = 0;

  PROMOTIONS.forEach(promo => {
    if (promo.type === 'product_set') {
      // Находим количество наборов ДО возврата
      const beforeQuantities = promo.requiredProductIds.map(id => {
        const item = sale.items.find(i => i.productId === id);
        return item ? item.quantity : 0;
      });
      const setsBefore = Math.min(...beforeQuantities);

      // Находим количество наборов ПОСЛЕ возврата
      const afterQuantities = promo.requiredProductIds.map(id => {
        return remainingItems[id] || 0;
      });
      const setsAfter = Math.min(...afterQuantities);

      // Потерянные наборы
      const lostSets = setsBefore - setsAfter;
      if (lostSets > 0) {
        lostDiscount += promo.discount * lostSets;
      }
    }
  });

  // Итоговая сумма возврата = сумма товаров - потерянные скидки
  return Math.max(0, returnSubtotal - lostDiscount);
}

// =============================================
// Статистика
// =============================================
function renderStats() {
  const sales = DB.getSales();
  const logs = DB.getLogs();
  const container = document.getElementById('stats-content');

  if (sales.length === 0 && logs.filter(l => l.type === 'return').length === 0) {
    container.innerHTML = '<div class="stats-empty">Нет данных</div>';
    return;
  }

  // Группируем по дням
  const daysMap = {};

  sales.forEach(sale => {
    const date = new Date(sale.timestamp);
    const dayKey = date.toISOString().split('T')[0];

    if (!daysMap[dayKey]) {
      daysMap[dayKey] = { sales: 0, returns: 0, salesCount: 0, returnsCount: 0, categories: {}, products: {} };
    }
    daysMap[dayKey].sales += sale.total;
    daysMap[dayKey].salesCount++;

    // Считаем категории для этого дня
    sale.items.forEach(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) return;
      const catId = product.categoryId;
      const cat = CATEGORIES.find(c => c.id === catId);
      const catName = cat ? cat.name : catId;

      if (!daysMap[dayKey].categories[catId]) {
        daysMap[dayKey].categories[catId] = { name: catName, sold: 0, returned: 0 };
      }
      daysMap[dayKey].categories[catId].sold += item.quantity;

      // Считаем по товарам
      if (!daysMap[dayKey].products[item.productId]) {
        daysMap[dayKey].products[item.productId] = { name: item.productName, sold: 0, returned: 0 };
      }
      daysMap[dayKey].products[item.productId].sold += item.quantity;
    });
  });

  logs.filter(l => l.type === 'return').forEach(log => {
    const date = new Date(log.timestamp);
    const dayKey = date.toISOString().split('T')[0];

    if (!daysMap[dayKey]) {
      daysMap[dayKey] = { sales: 0, returns: 0, salesCount: 0, returnsCount: 0, categories: {}, products: {} };
    }
    daysMap[dayKey].returns += log.total;
    daysMap[dayKey].returnsCount++;

    // Считаем возвраты по категориям и товарам
    if (log.items) {
      log.items.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (!product) return;
        const catId = product.categoryId;
        if (!daysMap[dayKey].categories[catId]) {
          const cat = CATEGORIES.find(c => c.id === catId);
          daysMap[dayKey].categories[catId] = { name: cat ? cat.name : catId, sold: 0, returned: 0 };
        }
        daysMap[dayKey].categories[catId].returned += item.quantity;

        // Считаем по товарам
        if (!daysMap[dayKey].products[item.productId]) {
          daysMap[dayKey].products[item.productId] = { name: item.productName, sold: 0, returned: 0 };
        }
        daysMap[dayKey].products[item.productId].returned += item.quantity;
      });
    }
  });

  // Сортируем по дате (новые сверху)
  const days = Object.entries(daysMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, data]) => ({ date, ...data }));

  // Рендер HTML
  let html = '<div class="stats-actions">';
  html += '<button class="btn btn-secondary" onclick="exportStats()">📋 Экспорт статистики</button>';
  html += '</div>';

  html += '<div class="stats-days">';

  days.forEach(day => {
    const dateStr = formatDateShort(day.date);
    const net = day.sales - day.returns;

    // Категории компактной строкой
    const cats = Object.values(day.categories);
    let categoriesHtml = '';
    if (cats.length > 0) {
      const catLines = cats.map(cat => {
        const netQty = cat.sold - cat.returned;
        let line = `${cat.name}: продано ${cat.sold}`;
        if (cat.returned > 0) {
          line += `, возвращено ${cat.returned}`;
        }
        line += `, итого ${netQty}`;
        return line;
      });
      categoriesHtml = `<div class="stat-day-categories">${catLines.join('<br>')}</div>`;
    }

    // Товары компактной строкой
    const prods = Object.values(day.products);
    let productsHtml = '';
    if (prods.length > 0) {
      const prodLines = prods.map(prod => {
        const netQty = prod.sold - prod.returned;
        let line = `${prod.name}: продано ${prod.sold}`;
        if (prod.returned > 0) {
          line += `, возвращено ${prod.returned}`;
        }
        line += `, итого ${netQty}`;
        return line;
      });
      productsHtml = `<div class="stat-day-products">${prodLines.join('<br>')}</div>`;
    }

    html += `
      <div class="stat-day-card">
        <div class="stat-day-date">${dateStr}</div>
        <div class="stat-day-details">
          <div class="stat-day-row">
            <span class="label">Продажи:</span>
            <span class="value sales">${formatPrice(day.sales)}</span>
            <span class="count">(${day.salesCount})</span>
          </div>
          ${day.returns > 0 ? `
            <div class="stat-day-row">
              <span class="label">Возвраты:</span>
              <span class="value returns">−${formatPrice(day.returns)}</span>
              <span class="count">(${day.returnsCount})</span>
            </div>
          ` : ''}
          <div class="stat-day-row total">
            <span class="label">Итого:</span>
            <span class="value ${net >= 0 ? 'sales' : 'returns'}">${formatPrice(net)}</span>
          </div>
          ${categoriesHtml}
          ${productsHtml}
        </div>
      </div>
    `;
  });

  html += '</div>';

  container.innerHTML = html;
}

function exportStats() {
  const sales = DB.getSales();
  const logs = DB.getLogs();

  if (sales.length === 0 && logs.filter(l => l.type === 'return').length === 0) {
    showToast('Нет данных для экспорта', 'error');
    return;
  }

  // Группируем по дням
  const daysMap = {};

  sales.forEach(sale => {
    const date = new Date(sale.timestamp);
    const dayKey = date.toISOString().split('T')[0];

    if (!daysMap[dayKey]) {
      daysMap[dayKey] = { date: dayKey, sales: 0, returns: 0, salesCount: 0, returnsCount: 0, categories: {}, products: {} };
    }
    daysMap[dayKey].sales += sale.total;
    daysMap[dayKey].salesCount++;

    sale.items.forEach(item => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (!product) return;
      const catId = product.categoryId;
      const cat = CATEGORIES.find(c => c.id === catId);
      const catName = cat ? cat.name : catId;

      if (!daysMap[dayKey].categories[catId]) {
        daysMap[dayKey].categories[catId] = { name: catName, sold: 0, returned: 0 };
      }
      daysMap[dayKey].categories[catId].sold += item.quantity;

      // Считаем по товарам
      if (!daysMap[dayKey].products[item.productId]) {
        daysMap[dayKey].products[item.productId] = { name: item.productName, sold: 0, returned: 0 };
      }
      daysMap[dayKey].products[item.productId].sold += item.quantity;
    });
  });

  logs.filter(l => l.type === 'return').forEach(log => {
    const date = new Date(log.timestamp);
    const dayKey = date.toISOString().split('T')[0];

    if (!daysMap[dayKey]) {
      daysMap[dayKey] = { date: dayKey, sales: 0, returns: 0, salesCount: 0, returnsCount: 0, categories: {}, products: {} };
    }
    daysMap[dayKey].returns += log.total;
    daysMap[dayKey].returnsCount++;

    if (log.items) {
      log.items.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (!product) return;
        const catId = product.categoryId;
        if (!daysMap[dayKey].categories[catId]) {
          const cat = CATEGORIES.find(c => c.id === catId);
          daysMap[dayKey].categories[catId] = { name: cat ? cat.name : catId, sold: 0, returned: 0 };
        }
        daysMap[dayKey].categories[catId].returned += item.quantity;

        // Считаем по товарам
        if (!daysMap[dayKey].products[item.productId]) {
          daysMap[dayKey].products[item.productId] = { name: item.productName, sold: 0, returned: 0 };
        }
        daysMap[dayKey].products[item.productId].returned += item.quantity;
      });
    }
  });

  // Преобразуем в массив и добавляем итоги по категориям и товарам
  const days = Object.values(daysMap)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(day => {
      const categories = Object.values(day.categories).map(cat => ({
        name: cat.name,
        sold: cat.sold,
        returned: cat.returned,
        net: cat.sold - cat.returned
      }));
      const products = Object.values(day.products).map(prod => ({
        name: prod.name,
        sold: prod.sold,
        returned: prod.returned,
        net: prod.sold - prod.returned
      }));
      return {
        date: day.date,
        sales: day.sales,
        returns: day.returns,
        net: day.sales - day.returns,
        salesCount: day.salesCount,
        returnsCount: day.returnsCount,
        categories,
        products
      };
    });

  const json = JSON.stringify(days, null, 2);

  // Показываем в модалке с кнопкой копирования
  const content = `
    <h2>📋 Экспорт статистики</h2>
    <div class="modal-actions" style="margin-bottom: 12px;">
      <button class="btn btn-primary" onclick="copyStatsToClipboard()">📋 Скопировать</button>
      <button class="btn btn-secondary" onclick="downloadStats()">💾 Скачать</button>
      <button class="btn btn-secondary" onclick="closeModal()">Закрыть</button>
    </div>
    <textarea id="stats-json" readonly style="
      width: 100%;
      height: 400px;
      background: var(--surface2);
      color: var(--text);
      border: 1px solid var(--surface3);
      border-radius: var(--radius-sm);
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      resize: vertical;
    ">${json}</textarea>
  `;

  openModal(content);
}

function copyStatsToClipboard() {
  const textarea = document.getElementById('stats-json');
  textarea.select();
  navigator.clipboard.writeText(textarea.value).then(() => {
    showToast('Скопировано в буфер', 'success');
  }).catch(() => {
    // Fallback для старых браузеров
    document.execCommand('copy');
    showToast('Скопировано', 'success');
  });
}

function downloadStats() {
  const textarea = document.getElementById('stats-json');
  const blob = new Blob([textarea.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stats-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Файл скачан', 'success');
}

function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

// =============================================
// Модальные окна
// =============================================
function openModal(content) {
  const overlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-content');
  modalContent.innerHTML = content;
  overlay.classList.remove('hidden');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
}

// =============================================
// Тосты (уведомления)
// =============================================
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast';
  if (type) toast.classList.add(type);
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

// =============================================
// Утилиты
// =============================================
function formatPrice(price) {
  return price.toLocaleString('ru-RU') + ' ₽';
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  
  if (isToday) {
    return `Сегодня, ${time}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Вчера, ${time}`;
  }
  
  const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  return `${dateStr}, ${time}`;
}