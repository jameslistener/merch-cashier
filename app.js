// =============================================
// Основная логика приложения
// =============================================

let currentCategory = 'all';
let currentLogFilter = 'all';
let currentStatsPeriod = 'today';

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
    const qty = stock[product.id] || 0;
    const outOfStock = qty === 0;
    const priceText = product.price === 0 ? 'Бесплатно' : formatPrice(product.price);

    html += `
      <div class="product-card ${outOfStock ? 'out-of-stock' : ''}" onclick="showProductDetail(${product.id})">
        ${productImg(product)}
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-price">${priceText}</div>
          <div class="product-stock">${outOfStock ? 'Нет в наличии' : `В наличии: ${qty}`}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
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
    promosHtml += `<div class="promo-line discount">🎁 ${d.name}: −${formatPrice(d.amount)}</div>`;
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
  
  // Проверяем акции
  PROMOTIONS.forEach(promo => {
    if (promo.type === 'combo_discount') {
      const hasAll = promo.requiredProductIds.every(id => 
        cartItems.some(item => item.product.id === id)
      );
      if (hasAll) {
        discounts.push({
          name: promo.name,
          amount: promo.discount
        });
      }
    } else if (promo.type === 'gift_by_total') {
      if (subtotal > promo.threshold) {
        const giftProduct = PRODUCTS.find(p => p.id === promo.giftProductId);
        if (giftProduct) {
          gifts.push({
            name: promo.name,
            productId: giftProduct.id,
            productName: giftProduct.name
          });
        }
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
}

function removeFromCart(productId) {
  DB.removeFromCart(productId, 1);
  updateCartBadge();
  renderCart();
}

function clearCart() {
  DB.clearCart();
  updateCartBadge();
  renderCart();
  showToast('Корзина очищена');
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
  
  DB.addSale(sale);
  
  // Логируем
  DB.addLog({
    type: 'sale',
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
  renderCatalog();
  renderStock();
  
  showToast(`Продажа: ${formatPrice(total)}`, 'success');
}

function updateCartBadge() {
  const cart = DB.getCart();
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const badge = document.getElementById('cart-badge');
  const countEl = document.getElementById('cart-count');
  
  if (count > 0) {
    badge.classList.remove('hidden');
    countEl.textContent = count;
  } else {
    badge.classList.add('hidden');
  }
}

// =============================================
// Склад
// =============================================
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
        ${log.type === 'sale' ? `<button class="btn btn-danger" style="margin-top: 10px; width: 100%; padding: 10px;" onclick="showReturnModal('${log.id}')">↩️ Возврат</button>` : ''}
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
    <p style="color: var(--text-dim); margin-bottom: 16px;">Выберите товары для возврата</p>
    ${itemsHtml}
    <div class="modal-actions">
      <button class="btn btn-danger" onclick="processReturn('${saleId}')">Вернуть</button>
      <button class="btn btn-secondary" onclick="closeModal()">Отмена</button>
    </div>
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
  let returnTotal = 0;
  
  sale.items.forEach((item, idx) => {
    const checkbox = document.getElementById(`return-check-${idx}`);
    if (checkbox && checkbox.checked) {
      returnItems.push(item);
      returnTotal += item.price * item.quantity;
      
      // Возвращаем на склад
      DB.addStock(item.productId, item.quantity);
    }
  });
  
  if (returnItems.length === 0) {
    showToast('Ничего не выбрано', 'error');
    return;
  }
  
  // Логируем возврат
  DB.addLog({
    type: 'return',
    saleId: saleId,
    items: returnItems,
    total: returnTotal
  });
  
  closeModal();
  renderLogs();
  renderCatalog();
  renderStock();
  showToast(`Возврат: ${formatPrice(returnTotal)}`, 'success');
}

// =============================================
// Статистика
// =============================================
function renderStats() {
  const sales = DB.getSales();
  const logs = DB.getLogs();
  const container = document.getElementById('stats-content');
  
  // Фильтруем по периоду
  const now = Date.now();
  let cutoff = 0;
  
  if (currentStatsPeriod === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    cutoff = today.getTime();
  } else if (currentStatsPeriod === 'week') {
    cutoff = now - 7 * 24 * 60 * 60 * 1000;
  }
  
  const filteredSales = sales.filter(s => new Date(s.timestamp).getTime() >= cutoff);
  const returnLogs = logs.filter(l => l.type === 'return' && new Date(l.timestamp).getTime() >= cutoff);
  
  // Считаем метрики
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalSalesCount = filteredSales.length;
  const totalReturns = returnLogs.reduce((sum, r) => sum + r.total, 0);
  const returnsCount = returnLogs.length;
  const avgCheck = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  
  // Топ товаров
  const itemCounts = {};
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!itemCounts[item.productId]) {
        itemCounts[item.productId] = { name: item.productName, count: 0 };
      }
      itemCounts[item.productId].count += item.quantity;
    });
  });
  
  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  let html = `
    <div class="stat-card">
      <div class="stat-card-title">Выручка</div>
      <div class="stat-card-value money">${formatPrice(totalRevenue)}</div>
      <div class="stat-card-sub">${totalSalesCount} продаж</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-card-title">Средний чек</div>
      <div class="stat-card-value count">${formatPrice(avgCheck)}</div>
    </div>
    
    <div class="stat-card">
      <div class="stat-card-title">Возвраты</div>
      <div class="stat-card-value returns">${formatPrice(totalReturns)}</div>
      <div class="stat-card-sub">${returnsCount} возвратов</div>
    </div>
  `;
  
  if (topItems.length > 0) {
    html += `
      <div class="stat-top-items">
        <h3>Топ товаров</h3>
        ${topItems.map(item => `
          <div class="stat-top-item">
            <span class="stat-top-item-name">${item.name}</span>
            <span class="stat-top-item-count">${item.count} шт.</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  container.innerHTML = html;
}

function setStatsPeriod(period) {
  currentStatsPeriod = period;
  
  document.querySelectorAll('.stats-period .filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.period === period);
  });
  
  renderStats();
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