/**
 * Centralized Product Image System
 * --------------------------------------------------------------------------
 * Product images are REAL photos served from the app itself (same-origin files
 * under `frontend/public/images/products/`). Because they are not loaded from a
 * third-party CDN, they are always available — nothing to rate-limit, block or
 * 404 in a restricted/offline environment.
 *
 * Resolution is deterministic and metadata-driven:
 *   1. A curated, category-validated photo keyed by product id.
 *   2. Otherwise a category-representative photo (so the image still matches the
 *      product's category — never an unrelated category).
 *   3. As a final safety net (only if a file ever fails to load), the frontend
 *      `onError` handler swaps in a category-coloured SVG tile (see
 *      frontend/src/utils/productImage.js). getCategoryFallbackImage() below
 *      produces the same tile for any server-side need.
 *
 * The same product always resolves to the same image.
 */

const IMAGE_BASE = '/images/products';

// ─── PER-PRODUCT PHOTOS (image key + the category it depicts) ────────────────
export const PRODUCT_IMAGES = {
  // Health
  prod_001: { key: 'thermometer', category: 'Health' },
  prod_002: { key: 'medicine', category: 'Health' },
  prod_003: { key: 'ors', category: 'Health' },
  prod_005: { key: 'bandaid', category: 'Health' },
  prod_006: { key: 'medicine', category: 'Health' },
  prod_007: { key: 'bandaid', category: 'Health' },

  // Baby Care
  prod_004: { key: 'babycare', category: 'Baby Care' },

  // Food
  prod_010: { key: 'noodles', category: 'Food' },
  prod_011: { key: 'bread', category: 'Food' },
  prod_012: { key: 'eggs', category: 'Food' },
  prod_013: { key: 'butter', category: 'Food' },
  prod_014: { key: 'milk', category: 'Food' },
  prod_014a: { key: 'milk', category: 'Food' },
  prod_015: { key: 'pasta', category: 'Food' },
  prod_016: { key: 'pastasauce', category: 'Food' },
  prod_017: { key: 'rice', category: 'Food' },

  // Dessert
  prod_018: { key: 'icecream', category: 'Dessert' },
  prod_019: { key: 'cake', category: 'Dessert' },

  // Snacks
  prod_019a: { key: 'popcorn', category: 'Snacks' },
  prod_023: { key: 'chips', category: 'Snacks' },

  // Party
  prod_019b: { key: 'party', category: 'Party' },
  prod_020: { key: 'party', category: 'Party' },
  prod_021: { key: 'plates', category: 'Party' },
  prod_024: { key: 'birthdaycandles', category: 'Party' },
  prod_025: { key: 'party', category: 'Party' },
  prod_031a: { key: 'plates', category: 'Party' },

  // Home
  prod_019c: { key: 'tissues', category: 'Home' },
  prod_052: { key: 'candles', category: 'Home' },

  // Beverages
  prod_022: { key: 'softdrinks', category: 'Beverages' },
  prod_074: { key: 'coffee', category: 'Beverages' },
  prod_075: { key: 'softdrinks', category: 'Beverages' },
  prod_075a: { key: 'proteinbar', category: 'Beverages' },

  // Pet Care
  prod_023a: { key: 'pet', category: 'Pet Care' },
  prod_023b: { key: 'pet', category: 'Pet Care' },
  prod_023c: { key: 'pet', category: 'Pet Care' },
  prod_023d: { key: 'pet', category: 'Pet Care' },
  prod_080: { key: 'pet', category: 'Pet Care' },
  prod_081: { key: 'pet', category: 'Pet Care' },
  prod_082: { key: 'pet', category: 'Pet Care' },

  // Cleaning
  prod_030: { key: 'cleaning', category: 'Cleaning' },
  prod_031: { key: 'papertowel', category: 'Cleaning' },
  prod_032: { key: 'cleaning', category: 'Cleaning' },
  prod_033: { key: 'cleaning', category: 'Cleaning' },

  // Personal Care
  prod_040: { key: 'personalcare', category: 'Personal Care' },
  prod_041: { key: 'towel', category: 'Personal Care' },
  prod_042: { key: 'personalcare', category: 'Personal Care' },
  prod_043: { key: 'soap', category: 'Personal Care' },

  // Electronics
  prod_050: { key: 'powerbank', category: 'Electronics' },
  prod_051: { key: 'usbcable', category: 'Electronics' },
  prod_053: { key: 'flashlight', category: 'Electronics' },
  prod_054: { key: 'batteries', category: 'Electronics' },
  prod_054a: { key: 'powerbank', category: 'Electronics' },

  // Accessories
  prod_060: { key: 'umbrella', category: 'Accessories' },
  prod_061: { key: 'raincoat', category: 'Accessories' },

  // Stationery
  prod_070: { key: 'stationery', category: 'Stationery' },
  prod_071: { key: 'stationery', category: 'Stationery' },
  prod_072: { key: 'stationery', category: 'Stationery' },
  prod_073: { key: 'stationery', category: 'Stationery' }
};

// Category-representative photo for any product without a specific entry, so the
// image still matches the product's category (never an unrelated category).
const CATEGORY_DEFAULT_KEY = {
  Health: 'medicine',
  'Baby Care': 'babycare',
  Food: 'bread',
  Dessert: 'cake',
  Snacks: 'chips',
  Beverages: 'softdrinks',
  Party: 'party',
  Home: 'tissues',
  'Pet Care': 'pet',
  Cleaning: 'cleaning',
  'Personal Care': 'personalcare',
  Electronics: 'electronics',
  Accessories: 'umbrella',
  Stationery: 'stationery'
};

function photoUrl(key) {
  return `${IMAGE_BASE}/${key}.jpg`;
}

// ─── SVG TILE FALLBACK (theme + icon + label) ────────────────────────────────
const CATEGORY_PALETTE = {
  Health: ['#e7f5ec', '#1f8a4c'],
  'Baby Care': ['#fdeef5', '#c2557f'],
  Food: ['#fff3e2', '#c9791a'],
  Dessert: ['#fde7ef', '#bd4a75'],
  Snacks: ['#fff6df', '#b8870b'],
  Beverages: ['#e7f0fb', '#2563a8'],
  Party: ['#f4eafb', '#7e40b2'],
  Home: ['#eef2f7', '#566b86'],
  'Pet Care': ['#e9f6ee', '#388a52'],
  Cleaning: ['#e4f6f8', '#1c8a99'],
  'Personal Care': ['#eceffb', '#4a54aa'],
  Electronics: ['#eceff4', '#3a4253'],
  Accessories: ['#e8f3fb', '#2f6aaa'],
  Stationery: ['#fdf2e6', '#bf7a1e']
};

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function svgTile(label, category) {
  const [bg, fg] = CATEGORY_PALETTE[category] || ['#eef2f7', '#64748b'];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">` +
    `<rect width="400" height="400" fill="${bg}"/>` +
    `<text x="200" y="200" font-family="Arial, Helvetica, sans-serif" font-size="26" ` +
    `font-weight="700" fill="${fg}" text-anchor="middle" dominant-baseline="middle">` +
    `${escapeXml(label || category || 'Product')}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getCategoryFallbackImage(category) {
  return svgTile(category, category);
}

export const GENERIC_PLACEHOLDER = svgTile('Product', 'Product');

// ─── RESOLVER ────────────────────────────────────────────────────────────────
export function resolveProductImage(product) {
  if (!product) return GENERIC_PLACEHOLDER;

  const entry = PRODUCT_IMAGES[product.id];
  if (entry && (!product.category || entry.category === product.category)) {
    return photoUrl(entry.key);
  }

  const categoryKey = CATEGORY_DEFAULT_KEY[product.category];
  if (categoryKey) return photoUrl(categoryKey);

  // No photo available for this category → SVG fallback (never cross-category).
  return getCategoryFallbackImage(product.category);
}

export default { PRODUCT_IMAGES, resolveProductImage, getCategoryFallbackImage, GENERIC_PLACEHOLDER };
