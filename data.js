// =============================================
// Захардкоженные данные: категории, товары, акции
// =============================================

const CATEGORIES = [
  { id: 'postcards',  name: 'Открытки',  icon: '💌' },
  { id: 'keychains',  name: 'Брелоки',   icon: '🔑' },
  { id: 'badges',     name: 'Значки',    icon: '🏅' },
  { id: 'posters',    name: 'Плакаты',   icon: '🖼️' },
  { id: 'stickers',   name: 'Наклейки',  icon: '🏷️' }
];

const PRODUCTS = [
  // --- Открытки ---
  { id: 1,  name: 'Открытка «Котик»',   price: 150, categoryId: 'postcards', emoji: '🐱' },
  { id: 2,  name: 'Открытка «Закат»',   price: 150, categoryId: 'postcards', emoji: '🌅' },
  { id: 3,  name: 'Открытка «Город»',   price: 200, categoryId: 'postcards', emoji: '🏙️' },

  // --- Брелоки ---
  { id: 4,  name: 'Брелок «Звезда»',    price: 250, categoryId: 'keychains', emoji: '⭐' },
  { id: 5,  name: 'Брелок «Сердце»',    price: 250, categoryId: 'keychains', emoji: '❤️' },
  { id: 6,  name: 'Брелок «Луна»',      price: 300, categoryId: 'keychains', emoji: '🌙' },

  // --- Значки ---
  { id: 7,  name: 'Значок «Огонь»',     price: 200, categoryId: 'badges',    emoji: '🔥' },
  { id: 8,  name: 'Значок «Молния»',    price: 200, categoryId: 'badges',    emoji: '⚡' },
  { id: 9,  name: 'Значок «Радуга»',    price: 250, categoryId: 'badges',    emoji: '🌈' },

  // --- Плакаты ---
  { id: 10, name: 'Постер «Космос»',    price: 500, categoryId: 'posters',   emoji: '🚀' },
  { id: 11, name: 'Постер «Океан»',     price: 500, categoryId: 'posters',   emoji: '🌊' },
  { id: 12, name: 'Постер «Лес»',       price: 450, categoryId: 'posters',   emoji: '🌲' },

  // --- Наклейки ---
  { id: 13, name: 'Наклейка «Смайлик»', price: 100, categoryId: 'stickers',  emoji: '😊' },
  { id: 14, name: 'Наклейка «Единорог»',price: 120, categoryId: 'stickers',  emoji: '🦄' },
  { id: 15, name: 'Наклейка «Ракета»',  price: 100, categoryId: 'stickers',  emoji: '🎯' }
];

// =============================================
// Акции (promotions)
// =============================================
const PROMOTIONS = [
  {
    id: 'promo_combo_1',
    name: 'Комбо «Котик + Звезда»',
    description: 'Скидка 100 ₽, если в корзине «Открытка Котик» и «Брелок Звезда»',
    type: 'combo_discount',
    requiredProductIds: [1, 4],   // Открытка «Котик» + Брелок «Звезда»
    discount: 100
  },
  {
    id: 'promo_combo_2',
    name: 'Комбо «Огонь + Молния»',
    description: 'Скидка 80 ₽, если в корзине «Значок Огонь» и «Значок Молния»',
    type: 'combo_discount',
    requiredProductIds: [7, 8],
    discount: 80
  },
  {
    id: 'promo_gift_total',
    name: 'Подарок за большую сумму',
    description: 'Если сумма корзины > 1500 ₽ — наклейка «Смайлик» в подарок',
    type: 'gift_by_total',
    threshold: 1500,
    giftProductId: 13   // Наклейка «Смайлик»
  },
  {
    id: 'promo_gift_poster',
    name: 'Постер в подарок',
    description: 'Если сумма корзины > 2500 ₽ — постер «Лес» в подарок',
    type: 'gift_by_total',
    threshold: 2500,
    giftProductId: 12   // Постер «Лес»
  }
];