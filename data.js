// =============================================
// Данные: категории, товары, акции
// =============================================

const CATEGORIES = [
  { id: 'stickers',      name: 'Одиночные стикеры',icon: '🏷️' },
  { id: 'stickerpacks',  name: 'Стикерпаки',       icon: '📦' },
  { id: 'badges',        name: 'Значки',           icon: '🏅' },
  { id: 'swapcards',     name: 'Своп-карты',       icon: '🃏' },
  { id: 'postcards',     name: 'Открытки',         icon: '💌' },
  { id: 'posters',       name: 'Плакаты',          icon: '🖼️' },
  { id: 'keychain',      name: 'Брелоки',          icon: '🔑' },
  { id: 'free_stuff',    name: 'Подарочное',       icon: '🎁' }
];

const PRODUCTS = [
  // --- Открытки (postcards) ---
  { id: 1,  name: 'Открытка «Scanty»',        price: 200, categoryId: 'postcards',    image: 'products/postcards/scanty.png' },
  { id: 2,  name: 'Открытка «Kneesocks»',     price: 200, categoryId: 'postcards',    image: 'products/postcards/kneesocks.png' },
  { id: 3,  name: 'Открытка «Stocking»',      price: 200, categoryId: 'postcards',    image: 'products/postcards/stocking.png' },
  { id: 4,  name: 'Открытка «Panty»',         price: 200, categoryId: 'postcards',    image: 'products/postcards/panty.png' },
  { id: 5,  name: 'Открытка «Bocci Gorilla»', price: 200, categoryId: 'postcards',    image: 'products/postcards/bocci_gorilla.png' },
  { id: 6,  name: 'Открытка «Miku HMO»',      price: 200, categoryId: 'postcards',    image: 'products/postcards/miku_hmo.png' },
  { id: 7,  name: 'Открытка «Miku UFO»',      price: 200, categoryId: 'postcards',    image: 'products/postcards/miku_ufo.png' },

  // --- Брелоки (keychain) ---
  { id: 8,  name: 'Брелок «Yotsuba»',         price: 300, categoryId: 'keychain',     image: 'products/keychain/yotsuba.png' },

  // --- Значки (badges) ---
  { id: 9,  name: 'Значок «Bocci»',           price: 250, categoryId: 'badges',       image: 'products/badges/bocci.png' },
  { id: 10, name: 'Значок «Mew»',             price: 250, categoryId: 'badges',       image: 'products/badges/mew.png' },
  { id: 11, name: 'Значок «Slowpoke»',        price: 250, categoryId: 'badges',       image: 'products/badges/slowpoke.png' },
  { id: 12, name: 'Значок «Meowth»',          price: 250, categoryId: 'badges',       image: 'products/badges/meowth.png' },

  // --- Плакаты (posters) ---
  { id: 13, name: 'Постер «Miku Calne Ca»',   price: 500, categoryId: 'posters',      image: 'products/posters/miku_calne_ca.png' },
  { id: 14, name: 'Постер «Sonico Horiz»',    price: 500, categoryId: 'posters',      image: 'products/posters/sonico_horiz.png' },
  { id: 15, name: 'Постер «Sonico Vert»',     price: 500, categoryId: 'posters',      image: 'products/posters/sonico_vert.png' },
  { id: 16, name: 'Постер «Bocci»',           price: 500, categoryId: 'posters',      image: 'products/posters/bocci.png' },

  // --- Наклейки (stickers) ---
  { id: 17, name: 'Наклейка «Miku Paint»',    price: 150, categoryId: 'stickers',     image: 'products/stickers/miku_paint.png' },
  { id: 18, name: 'Наклейка «Scanty»',        price: 150, categoryId: 'stickers',     image: 'products/stickers/scanty.png' },
  { id: 19, name: 'Наклейка «Kneesocks»',     price: 150, categoryId: 'stickers',     image: 'products/stickers/kneesocks.png' },
  { id: 20, name: 'Наклейка «Stocking»',      price: 150, categoryId: 'stickers',     image: 'products/stickers/stocking.png' },
  { id: 21, name: 'Наклейка «Panty»',         price: 150, categoryId: 'stickers',     image: 'products/stickers/panty.png' },

  // --- Наборы наклеек (stickerpacks) ---
  { id: 22, name: 'Набор «Miku HMO & UFO»',   price: 400, categoryId: 'stickerpacks', image: 'products/stickerpacks/miku_hmo_ufo.png' },
  { id: 23, name: 'Набор «Bocci»',            price: 400, categoryId: 'stickerpacks', image: 'products/stickerpacks/bocci.png' },
  { id: 24, name: 'Набор «Sonico»',           price: 400, categoryId: 'stickerpacks', image: 'products/stickerpacks/sonico.png' },
  { id: 25, name: 'Набор «Miku Calne Ca»',    price: 400, categoryId: 'stickerpacks', image: 'products/stickerpacks/miku_calne_ca.png' },
  { id: 26, name: 'Набор «Sanrio»',           price: 400, categoryId: 'stickerpacks', image: 'products/stickerpacks/sanrio.png' },
  { id: 27, name: 'Набор «Pokemon»',          price: 400, categoryId: 'stickerpacks', image: 'products/stickerpacks/pokemon.png' },

  // --- Обменные карточки (swapcards) ---
  { id: 28, name: 'Своп-карта «Hippie»',      price: 200, categoryId: 'swapcards',    image: 'products/swapcards/hippie.png' },
  { id: 29, name: 'Своп-карта «Emo»',         price: 200, categoryId: 'swapcards',    image: 'products/swapcards/emo.png' },
  { id: 30, name: 'Своп-карта «Rap»',         price: 200, categoryId: 'swapcards',    image: 'products/swapcards/rap.png' },
  { id: 31, name: 'Своп-карта «Punk»',        price: 200, categoryId: 'swapcards',    image: 'products/swapcards/punk.png' },
  { id: 32, name: 'Своп-карта «Goth»',        price: 200, categoryId: 'swapcards',    image: 'products/swapcards/goth.png' },

  // --- Бесплатное (free_stuff) ---
  { id: 33, name: 'Подарок Hippie',           price: 0,   categoryId: 'free_stuff',   image: 'products/free_stuff/hippie.png' },
  { id: 34, name: 'Подарок Emo',              price: 0,   categoryId: 'free_stuff',   image: 'products/free_stuff/emo.png' },
  { id: 35, name: 'Подарок Rap',              price: 0,   categoryId: 'free_stuff',   image: 'products/free_stuff/rap.png' },
  { id: 36, name: 'Подарок Punk',             price: 0,   categoryId: 'free_stuff',   image: 'products/free_stuff/punk.png' },
  { id: 37, name: 'Подарок Goth',             price: 0,   categoryId: 'free_stuff',   image: 'products/free_stuff/goth.png' }
];

// =============================================
// Акции (promotions)
// =============================================
const PROMOTIONS = [
  {
    id: 'promo_combo_miku',
    name: 'Комбо «Miku»',
    description: 'Скидка 100 ₽, если в корзине открытка «Miku Hmo» и наклейка «Miku Paint»',
    type: 'combo_discount',
    requiredProductIds: [6, 17],
    discount: 100
  },
  {
    id: 'promo_combo_pokemon',
    name: 'Комбо «Pokemon»',
    description: 'Скидка 150 ₽, если в корзине значок «Meowth» и набор «Pokemon»',
    type: 'combo_discount',
    requiredProductIds: [12, 27],
    discount: 150
  },
  {
    id: 'promo_gift_swapcard',
    name: 'Карточка в подарок',
    description: 'Если сумма корзины > 1500 ₽ — обменная карточка «Hippie» в подарок',
    type: 'gift_by_total',
    threshold: 1500,
    giftProductId: 28
  },
  {
    id: 'promo_gift_stickerpack',
    name: 'Набор в подарок',
    description: 'Если сумма корзины > 2500 ₽ — набор наклеек «Sanrio» в подарок',
    type: 'gift_by_total',
    threshold: 2500,
    giftProductId: 26
  }
];
