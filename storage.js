// =============================================
// Локальное хранилище на базе localStorage
// =============================================

const DB = {
  // --- Ключи ---
  KEYS: {
    STOCK:      'kassa_stock',      // { productId: quantity }
    CART:       'kassa_cart',        // { productId: quantity }
    LOGS:       'kassa_logs',        // [ { id, type, ... } ]
    SALES:      'kassa_sales'        // [ { id, items, total, ... } ]
  },

  // --- Инициализация ---
  init() {
    if (!localStorage.getItem(this.KEYS.STOCK)) {
      localStorage.setItem(this.KEYS.STOCK, JSON.stringify({}));
    }
    if (!localStorage.getItem(this.KEYS.CART)) {
      localStorage.setItem(this.KEYS.CART, JSON.stringify({}));
    }
    if (!localStorage.getItem(this.KEYS.LOGS)) {
      localStorage.setItem(this.KEYS.LOGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.KEYS.SALES)) {
      localStorage.setItem(this.KEYS.SALES, JSON.stringify([]));
    }
  },

  // --- Склад (остатки) ---
  getStock() {
    return JSON.parse(localStorage.getItem(this.KEYS.STOCK) || '{}');
  },

  setStock(stock) {
    localStorage.setItem(this.KEYS.STOCK, JSON.stringify(stock));
  },

  addStock(productId, qty) {
    const stock = this.getStock();
    stock[productId] = (stock[productId] || 0) + qty;
    this.setStock(stock);
    return stock[productId];
  },

  removeStock(productId, qty) {
    const stock = this.getStock();
    stock[productId] = Math.max(0, (stock[productId] || 0) - qty);
    this.setStock(stock);
    return stock[productId];
  },

  // --- Корзина ---
  getCart() {
    return JSON.parse(localStorage.getItem(this.KEYS.CART) || '{}');
  },

  setCart(cart) {
    localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
  },

  addToCart(productId, qty = 1) {
    const cart = this.getCart();
    cart[productId] = (cart[productId] || 0) + qty;
    this.setCart(cart);
    return cart[productId];
  },

  removeFromCart(productId, qty = 1) {
    const cart = this.getCart();
    if (!cart[productId]) return 0;
    cart[productId] = Math.max(0, cart[productId] - qty);
    if (cart[productId] === 0) delete cart[productId];
    this.setCart(cart);
    return cart[productId] || 0;
  },

  clearCart() {
    localStorage.setItem(this.KEYS.CART, JSON.stringify({}));
  },

  clearStock() {
    localStorage.setItem(this.KEYS.STOCK, JSON.stringify({}));
  },

  clearLogs() {
    localStorage.setItem(this.KEYS.LOGS, JSON.stringify([]));
    localStorage.setItem(this.KEYS.SALES, JSON.stringify([]));
  },

  // --- Логи ---
  getLogs() {
    return JSON.parse(localStorage.getItem(this.KEYS.LOGS) || '[]');
  },

  addLog(entry) {
    const logs = this.getLogs();
    entry.id = Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    entry.timestamp = new Date().toISOString();
    logs.unshift(entry);
    // Храним логи за последние 7 дней
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const filtered = logs.filter(l => new Date(l.timestamp).getTime() > cutoff);
    localStorage.setItem(this.KEYS.LOGS, JSON.stringify(filtered));
    return entry;
  },

  // --- Продажи ---
  getSales() {
    return JSON.parse(localStorage.getItem(this.KEYS.SALES) || '[]');
  },

  addSale(sale) {
    const sales = this.getSales();
    sale.id = 'sale_' + Date.now();
    sale.timestamp = new Date().toISOString();
    sales.unshift(sale);
    // Храним продажи за последние 7 дней
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const filtered = sales.filter(s => new Date(s.timestamp).getTime() > cutoff);
    localStorage.setItem(this.KEYS.SALES, JSON.stringify(filtered));
    return sale;
  },

  // --- Очистка старых данных (>7 дней) ---
  cleanup() {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const logs = this.getLogs().filter(l => new Date(l.timestamp).getTime() > cutoff);
    const sales = this.getSales().filter(s => new Date(s.timestamp).getTime() > cutoff);
    localStorage.setItem(this.KEYS.LOGS, JSON.stringify(logs));
    localStorage.setItem(this.KEYS.SALES, JSON.stringify(sales));
  }
};