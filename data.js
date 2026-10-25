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
  { id: 1001,  name: 'Открытка A6 «Scanty»',        price: 150, categoryId: 'postcards',    image: 'products/postcards/scanty.png' },
  { id: 1002,  name: 'Открытка A6 «Kneesocks»',     price: 150, categoryId: 'postcards',    image: 'products/postcards/kneesocks.png' },
  { id: 1003,  name: 'Открытка A6 «Stocking»',      price: 150, categoryId: 'postcards',    image: 'products/postcards/stocking.png' },
  { id: 1004,  name: 'Открытка A6 «Panty»',         price: 150, categoryId: 'postcards',    image: 'products/postcards/panty.png' },
  { id: 1005,  name: 'Открытка A6 «Bocci Gorilla»', price: 150, categoryId: 'postcards',    image: 'products/postcards/bocci_gorilla.png' },
  { id: 1006,  name: 'Открытка A5 «Miku HMO»',      price: 200, categoryId: 'postcards',    image: 'products/postcards/miku_hmo.png' },
  { id: 1007,  name: 'Открытка A5 «Miku UFO»',      price: 200, categoryId: 'postcards',    image: 'products/postcards/miku_ufo.png' },
  { id: 1008,  name: 'Открытка A5 «Miku Calne Ca»', price: 200, categoryId: 'postcards',    image: 'products/postcards/miku_calne_ca.png' },
  { id: 1009,  name: 'Открытка A5 «Sonico Horiz»',  price: 200, categoryId: 'postcards',    image: 'products/postcards/sonico_horiz.png' },
  { id: 1010,  name: 'Открытка A5 «Sonico Vert»',   price: 200, categoryId: 'postcards',    image: 'products/postcards/sonico_vert.png' },

  // --- Брелоки (keychain) ---
  { id: 2001,  name: 'Брелок «Yotsuba»',         price: 600, categoryId: 'keychain',     image: 'products/keychain/yotsuba.png' },

  // --- Значки (badges) ---
  { id: 3001, name: 'Значок «Bocci»',           price: 300, categoryId: 'badges',       image: 'products/badges/bocci.png' },
  { id: 3002, name: 'Значок «Mew»',             price: 300, categoryId: 'badges',       image: 'products/badges/mew.png' },
  { id: 3003, name: 'Значок «Slowpoke»',        price: 300, categoryId: 'badges',       image: 'products/badges/slowpoke.png' },
  { id: 3004, name: 'Значок «Meowth»',          price: 300, categoryId: 'badges',       image: 'products/badges/meowth.png' },

  // --- Плакаты (posters) ---
  { id: 4001, name: 'Плакат A3 «Miku Calne Ca»',   price: 400, categoryId: 'posters',      image: 'products/posters/miku_calne_ca.png' },
  { id: 4002, name: 'Плакат A3 «Sonico Horiz»',    price: 400, categoryId: 'posters',      image: 'products/posters/sonico_horiz.png' },
  { id: 4003, name: 'Плакат A3 «Sonico Vert»',     price: 400, categoryId: 'posters',      image: 'products/posters/sonico_vert.png' },
  { id: 4004, name: 'Плакат A4 «Bocci»',           price: 300, categoryId: 'posters',      image: 'products/posters/bocci.png' },

  // --- Наклейки (stickers) ---
  { id: 5001, name: 'Наклейка «Miku Paint»',    price: 100, categoryId: 'stickers',     image: 'products/stickers/miku_paint.png' },
  { id: 5002, name: 'Наклейка «Scanty»',        price: 150, categoryId: 'stickers',     image: 'products/stickers/scanty.png' },
  { id: 5003, name: 'Наклейка «Kneesocks»',     price: 150, categoryId: 'stickers',     image: 'products/stickers/kneesocks.png' },
  { id: 5004, name: 'Наклейка «Stocking»',      price: 150, categoryId: 'stickers',     image: 'products/stickers/stocking.png' },
  { id: 5005, name: 'Наклейка «Panty»',         price: 150, categoryId: 'stickers',     image: 'products/stickers/panty.png' },

  // --- Наборы наклеек (stickerpacks) ---
  { id: 6001, name: 'Набор «Miku HMO & UFO»',   price: 300, categoryId: 'stickerpacks', image: 'products/stickerpacks/miku_hmo_ufo.png' },
  { id: 6002, name: 'Набор «Bocci»',            price: 350, categoryId: 'stickerpacks', image: 'products/stickerpacks/bocci.png' },
  { id: 6003, name: 'Набор «Sonico»',           price: 350, categoryId: 'stickerpacks', image: 'products/stickerpacks/sonico.png' },
  { id: 6004, name: 'Набор «Miku Calne Ca»',    price: 300, categoryId: 'stickerpacks', image: 'products/stickerpacks/miku_calne_ca.png' },
  { id: 6005, name: 'Набор «Sanrio»',           price: 200, categoryId: 'stickerpacks', image: 'products/stickerpacks/sanrio.png' },
  { id: 6006, name: 'Набор «Pokemon»',          price: 500, categoryId: 'stickerpacks', image: 'products/stickerpacks/pokemon.png' },

  // --- Обменные карточки (swapcards) ---
  { id: 7001, name: 'Своп-карта «Hippie»',      price: 100, categoryId: 'swapcards',    image: 'products/swapcards/hippie.png' },
  { id: 7002, name: 'Своп-карта «Emo»',         price: 100, categoryId: 'swapcards',    image: 'products/swapcards/emo.png' },
  { id: 7003, name: 'Своп-карта «Rap»',         price: 100, categoryId: 'swapcards',    image: 'products/swapcards/rap.png' },
  { id: 7004, name: 'Своп-карта «Punk»',        price: 100, categoryId: 'swapcards',    image: 'products/swapcards/punk.png' },
  { id: 7005, name: 'Своп-карта «Goth»',        price: 100, categoryId: 'swapcards',    image: 'products/swapcards/goth.png' },

  // --- Бесплатное (free_stuff) ---
  { id: 8001, name: 'Подарок Hippie',           price: 0,   categoryId: 'free_stuff',   image: 'products/free_stuff/hippie.png' },
  { id: 8002, name: 'Подарок Emo',              price: 0,   categoryId: 'free_stuff',   image: 'products/free_stuff/emo.png' },
  { id: 8003, name: 'Подарок Rap',              price: 0,   categoryId: 'free_stuff',   image: 'products/free_stuff/rap.png' },
  { id: 8004, name: 'Подарок Punk',             price: 0,   categoryId: 'free_stuff',   image: 'products/free_stuff/punk.png' },
  { id: 8005, name: 'Подарок Goth',             price: 0,   categoryId: 'free_stuff',   image: 'products/free_stuff/goth.png' }
];

// =============================================
// Акции (promotions)
// =============================================
const PROMOTIONS = [
  {
    id: 'set_postcards_ps',
    name: 'Набор открыток Panty & Stocking',
    description: 'Скидка 100 ₽ за каждый полный набор (открытки Scanty, Kneesocks, Stocking, Panty)',
    type: 'product_set',
    requiredProductIds: [1001, 1002, 1003, 1004], // Scanty, Kneesocks, Stocking, Panty
    discount: 100
  },
  {
    id: 'set_stickers_ps',
    name: 'Набор наклеек Panty & Stocking',
    description: 'Скидка 100 ₽ за каждый полный набор (наклейки Scanty, Kneesocks, Stocking, Panty)',
    type: 'product_set',
    requiredProductIds: [5002, 5003, 5004, 5005], // Scanty, Kneesocks, Stocking, Panty
    discount: 100
  },
  {
    id: 'set_swapcards_sanrio',
    name: 'Набор своп-карт Sanrio',
    description: 'Скидка 100 ₽ за каждый полный набор (своп-карты Hippie, Emo, Rap, Punk, Goth)',
    type: 'product_set',
    requiredProductIds: [7001, 7002, 7003, 7004, 7005], // Hippie, Emo, Rap, Punk, Goth
    discount: 100
  }
];
