/**
 * Frontend image fallback helper.
 *
 * The backend already resolves every product to a deterministic, category-correct
 * image. This helper provides a last-line-of-defense fallback used by <img onError>
 * handlers: if a remote image URL ever fails to load, we swap in a category-coloured
 * inline SVG placeholder (never a broken image, never an unrelated-category image).
 */

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

function svgPlaceholder(label, bg, fg) {
  const safeLabel = String(label || 'Product').replace(/[<>&]/g, ' ');
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>` +
    `<rect width='100%' height='100%' fill='${bg}'/>` +
    `<text x='50%' y='50%' font-family='Arial, Helvetica, sans-serif' font-size='30' font-weight='600' ` +
    `fill='${fg}' text-anchor='middle' dominant-baseline='middle'>${safeLabel}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getFallbackImage(category) {
  const [bg, fg] = CATEGORY_PALETTE[category] || ['#eef2f7', '#94a3b8'];
  return svgPlaceholder(category || 'Product', bg, fg);
}

/**
 * onError handler factory for <img> elements. Prevents infinite error loops and
 * substitutes a category-appropriate placeholder.
 */
export function handleImageError(category) {
  return (event) => {
    const img = event.currentTarget;
    img.onerror = null;
    img.src = getFallbackImage(category);
  };
}

export default { getFallbackImage, handleImageError };
