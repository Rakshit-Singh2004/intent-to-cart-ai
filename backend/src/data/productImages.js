/**
 * Centralized Product Image Mapping
 * --------------------------------------------------------------------------
 * Single source of truth for product imagery. Every product resolves to a
 * deterministic, category-correct image:
 *
 *   1. An explicit, curated image keyed by product id (PRODUCT_IMAGES).
 *   2. If no explicit image exists OR the curated image fails category
 *      validation, a category-specific placeholder is used (never an image
 *      from an unrelated category).
 *   3. A generic placeholder as the final safety net.
 *
 * Images are static/cached (no runtime image searches) so the same product
 * always renders the same image. Placeholders are inline SVG data URIs, so
 * they can never produce a broken image request.
 */

const UNSPLASH = (id, w = 400) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

// ─── EXPLICIT, CATEGORY-VALIDATED PRODUCT IMAGES ─────────────────────────────
// Each entry declares the category the image belongs to. resolveProductImage()
// only uses the image when that category matches the product's category, which
// guarantees a coffee product never shows a juice image, a protein bar never
// shows a personal-care image, etc.
export const PRODUCT_IMAGES = {
  // Health & Medicine
  prod_001: { url: UNSPLASH('photo-1584308666544-e63fe075efb2'), category: 'Health' },      // thermometer
  prod_002: { url: UNSPLASH('photo-1587854692152-cbe660dbde88'), category: 'Health' },      // syrup / medicine
  prod_003: { url: UNSPLASH('photo-1559757175-5700dde675bc'), category: 'Health' },         // ORS / sachets
  prod_005: { url: UNSPLASH('photo-1583947215259-38e31be8751f'), category: 'Health' },      // band-aid
  prod_006: { url: UNSPLASH('photo-1587854692152-cbe660dbde88'), category: 'Health' },      // antiseptic (medicine bottle)
  prod_007: { url: UNSPLASH('photo-1583947215259-38e31be8751f'), category: 'Health' },      // cotton / first aid

  // Food & Cooking
  prod_010: { url: UNSPLASH('photo-1612929633738-8fe44f7ec841'), category: 'Food' },         // instant noodles
  prod_011: { url: UNSPLASH('photo-1509440159596-0249088772ff'), category: 'Food' },         // bread
  prod_012: { url: UNSPLASH('photo-1582722872445-44dc5f7e3c8f'), category: 'Food' },         // eggs
  prod_013: { url: UNSPLASH('photo-1589985270826-4b7bb135bc9d'), category: 'Food' },         // butter
  prod_014: { url: UNSPLASH('photo-1563636619-e9143da7973b'), category: 'Food' },            // milk
  prod_014a: { url: UNSPLASH('photo-1563636619-e9143da7973b'), category: 'Food' },           // milk
  prod_015: { url: UNSPLASH('photo-1551462147-37885acc36f1'), category: 'Food' },            // pasta
  prod_016: { url: UNSPLASH('photo-1472476443507-c7a5948772fc'), category: 'Food' },         // pasta sauce
  prod_017: { url: UNSPLASH('photo-1586201375761-83865001e31c'), category: 'Food' },         // rice

  // Dessert
  prod_018: { url: UNSPLASH('photo-1501443762994-82bd5dace89a'), category: 'Dessert' },      // ice cream
  prod_019: { url: UNSPLASH('photo-1563729784474-d77dbb933a9e'), category: 'Dessert' },      // chocolate cake

  // Snacks
  prod_019a: { url: UNSPLASH('photo-1505576399279-565b52d4ac71'), category: 'Snacks' },      // popcorn
  prod_023: { url: UNSPLASH('photo-1566478989037-eec170784d0b'), category: 'Snacks' },       // chips

  // Party & Celebration
  prod_019b: { url: UNSPLASH('photo-1513151233558-d860c5398176'), category: 'Party' },       // disposable cups
  prod_020: { url: UNSPLASH('photo-1513151233558-d860c5398176'), category: 'Party' },        // party cups
  prod_021: { url: UNSPLASH('photo-1513151233558-d860c5398176'), category: 'Party' },        // paper plates
  prod_024: { url: UNSPLASH('photo-1602523961358-f9f03dd557db'), category: 'Party' },        // birthday candles
  prod_025: { url: UNSPLASH('photo-1513151233558-d860c5398176'), category: 'Party' },        // balloons / party
  prod_031a: { url: UNSPLASH('photo-1513151233558-d860c5398176'), category: 'Party' },       // disposable plates

  // Home
  prod_019c: { url: UNSPLASH('photo-1585421514738-01798e348b17'), category: 'Home' },        // tissues
  prod_052: { url: UNSPLASH('photo-1602523961358-f9f03dd557db'), category: 'Home' },         // candles

  // Beverages
  prod_022: { url: UNSPLASH('photo-1527960471264-932f39eb5846'), category: 'Beverages' },    // soft drinks
  prod_074: { url: UNSPLASH('photo-1509042239860-f550ce710b93'), category: 'Beverages' },    // coffee
  prod_075: { url: UNSPLASH('photo-1527960471264-932f39eb5846'), category: 'Beverages' },    // energy drink (can)

  // Pet Care
  prod_023a: { url: UNSPLASH('photo-1589924691995-400dc9ecc119'), category: 'Pet Care' },    // dog treats
  prod_023b: { url: UNSPLASH('photo-1589924691995-400dc9ecc119'), category: 'Pet Care' },    // chew sticks
  prod_023c: { url: UNSPLASH('photo-1589924691995-400dc9ecc119'), category: 'Pet Care' },    // pet bowl
  prod_023d: { url: UNSPLASH('photo-1589924691995-400dc9ecc119'), category: 'Pet Care' },    // dental chews
  prod_080: { url: UNSPLASH('photo-1589924691995-400dc9ecc119'), category: 'Pet Care' },     // dog food
  prod_081: { url: UNSPLASH('photo-1589924691995-400dc9ecc119'), category: 'Pet Care' },     // cat food
  prod_082: { url: UNSPLASH('photo-1589924691995-400dc9ecc119'), category: 'Pet Care' },     // poop bags

  // Cleaning
  prod_030: { url: UNSPLASH('photo-1585421514284-efb74c2b69ba'), category: 'Cleaning' },     // floor cleaner
  prod_031: { url: UNSPLASH('photo-1585421514284-efb74c2b69ba'), category: 'Cleaning' },     // paper towels
  prod_032: { url: UNSPLASH('photo-1585421514284-efb74c2b69ba'), category: 'Cleaning' },     // garbage bags
  prod_033: { url: UNSPLASH('photo-1585421514284-efb74c2b69ba'), category: 'Cleaning' },     // mop

  // Personal Care
  prod_040: { url: UNSPLASH('photo-1559650656-5d1d361ad10e'), category: 'Personal Care' },   // toothbrush combo
  prod_041: { url: UNSPLASH('photo-1583845112203-29329902332e'), category: 'Personal Care' },// towel
  prod_042: { url: UNSPLASH('photo-1559650656-5d1d361ad10e'), category: 'Personal Care' },   // shampoo
  prod_043: { url: UNSPLASH('photo-1559650656-5d1d361ad10e'), category: 'Personal Care' },   // soap

  // Electronics
  prod_050: { url: UNSPLASH('photo-1609091839311-d5365f9ff1c5'), category: 'Electronics' },  // power bank
  prod_051: { url: UNSPLASH('photo-1609091839311-d5365f9ff1c5'), category: 'Electronics' },  // usb-c cable
  prod_053: { url: UNSPLASH('photo-1609091839311-d5365f9ff1c5'), category: 'Electronics' },  // flashlight
  prod_054: { url: UNSPLASH('photo-1609091839311-d5365f9ff1c5'), category: 'Electronics' },  // AA batteries
  prod_054a: { url: UNSPLASH('photo-1609091839311-d5365f9ff1c5'), category: 'Electronics' }, // power bank fast

  // Accessories (rain gear)
  prod_060: { url: UNSPLASH('photo-1534397860164-120c97f4db0b'), category: 'Accessories' },  // umbrella
  prod_061: { url: UNSPLASH('photo-1534397860164-120c97f4db0b'), category: 'Accessories' },  // raincoat

  // Stationery
  prod_070: { url: UNSPLASH('photo-1531346878377-a5be20888e57'), category: 'Stationery' },   // notebook
  prod_071: { url: UNSPLASH('photo-1531346878377-a5be20888e57'), category: 'Stationery' },   // pen set
  prod_072: { url: UNSPLASH('photo-1531346878377-a5be20888e57'), category: 'Stationery' },   // highlighter
  prod_073: { url: UNSPLASH('photo-1531346878377-a5be20888e57'), category: 'Stationery' }    // sticky notes
};

// ─── CATEGORY-SPECIFIC FALLBACK PLACEHOLDERS ─────────────────────────────────
// Used whenever an explicit image is unavailable or fails validation. These are
// inline SVGs (no network request) so they always render and stay on-brand.
const CATEGORY_PALETTE = {
  Health: ['#e6f4ea', '#2e7d4f'],
  'Baby Care': ['#fdeef4', '#c2557f'],
  Food: ['#fff3e0', '#c77a18'],
  Dessert: ['#fce4ec', '#b84a73'],
  Snacks: ['#fff7e0', '#b8870b'],
  Beverages: ['#e8f1fb', '#2563a8'],
  Party: ['#f3e9fb', '#7b3fb0'],
  Home: ['#eef2f7', '#5a6b82'],
  'Pet Care': ['#eaf6ee', '#3a8a52'],
  Cleaning: ['#e6f6f8', '#1f8a99'],
  'Personal Care': ['#eef0fb', '#4b54a8'],
  Electronics: ['#eceff3', '#3a4252'],
  Accessories: ['#e9f3fb', '#2f6aa8'],
  Stationery: ['#fdf3e7', '#c07a1e']
};

function svgPlaceholder(label, bg = '#eef2f7', fg = '#94a3b8') {
  const safeLabel = String(label || 'Product').replace(/[<>&]/g, ' ');
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>` +
    `<rect width='100%' height='100%' fill='${bg}'/>` +
    `<text x='50%' y='50%' font-family='Arial, Helvetica, sans-serif' font-size='30' font-weight='600' ` +
    `fill='${fg}' text-anchor='middle' dominant-baseline='middle'>${safeLabel}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getCategoryFallbackImage(category) {
  const [bg, fg] = CATEGORY_PALETTE[category] || ['#eef2f7', '#94a3b8'];
  return svgPlaceholder(category || 'Product', bg, fg);
}

export const GENERIC_PLACEHOLDER = svgPlaceholder('Product');

// ─── VALIDATION ──────────────────────────────────────────────────────────────
// An image is valid for a product only when its declared category matches the
// product's category. This is the rule that prevents unrelated-category images.
function imageMatchesProduct(entry, product) {
  if (!entry || !entry.url) return false;
  if (!entry.category || !product.category) return true;
  return String(entry.category).toLowerCase() === String(product.category).toLowerCase();
}

// ─── RESOLVER ────────────────────────────────────────────────────────────────
export function resolveProductImage(product) {
  if (!product) return GENERIC_PLACEHOLDER;
  const entry = PRODUCT_IMAGES[product.id];
  if (entry && imageMatchesProduct(entry, product)) {
    return entry.url;
  }
  // No valid product-specific image → category fallback (never cross-category).
  return getCategoryFallbackImage(product.category) || GENERIC_PLACEHOLDER;
}

export default { PRODUCT_IMAGES, resolveProductImage, getCategoryFallbackImage, GENERIC_PLACEHOLDER };
