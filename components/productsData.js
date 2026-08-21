/* =========================================================
   productsData — fetches live data from the PHP API.
   Call initProducts() once on page load before rendering.
   Falls back to DEFAULT_PRODUCTS/CATEGORIES if API is
   unavailable (e.g. static preview without a PHP server).
   ========================================================= */

export const WHATSAPP_NUMBER = '919600879192';

export const DEFAULT_PRODUCTS = [
  {
    id: 'aqua-neptune',
    name: 'Aqua Neptune',
    image: 'assets/products/1.avif',
    colorImages: [
      'assets/images/product1/1.avif',
      'assets/images/product1/2.avif',
      'assets/images/product1/2.avif',
    ],
    category: 'multibrand-water-purifiers',
    descriptionList: [
      'Production capacity - 15 LPH',
      'Tank capacity - 10 L',
      'Food grade, non-breakable build',
      'ABS plastic construction',
      '10 liters storage',
      'LED indicator',
      'Auto on/off',
    ],
    variants: [
      { name: 'RO + Minerals', price: 8999 },
      { name: 'RO + Minerals + Alkaline', price: 9999 },
      { name: 'RO + Minerals + Copper', price: 9999 },
    ],
    includedItems: 'Stand, Cover, Pre-filter, Installation',
  },
  {
    id: 'aqua-purosis',
    name: 'Aqua Purosis',
    image: 'assets/products/2.avif',
    colorImages: [],
    category: 'multibrand-water-purifiers',
    descriptionList: [
      'Production capacity - 18 LPH',
      'Tank capacity - 12 L',
      'Wall-mounted, slim profile',
      'Multi-stage sediment + carbon filtration',
      '12 liters storage',
      'LED indicator',
      'Auto on/off',
    ],
    variants: [
      { name: 'RO + Minerals', price: 12499 },
      { name: 'RO + Minerals + Alkaline', price: 13499 },
      { name: 'RO + Minerals + Copper', price: 13499 },
    ],
    includedItems: 'Wall Bracket, Cover, Pre-filter, Installation',
  },
  {
    id: 'prolife-water-purifier',
    name: 'Prolife Water Purifier',
    image: 'assets/products/3.avif',
    colorImages: [],
    category: 'domestic-water-purifiers',
    descriptionList: [
      'Production capacity - 20 LPH',
      'Tank capacity - 10 L',
      'Smart digital display',
      'Copper-infused filtration',
      '10 liters storage',
      'LED indicator',
      'Auto on/off',
    ],
    variants: [
      { name: 'RO + Minerals', price: 15999 },
      { name: 'RO + Minerals + Alkaline', price: 16999 },
      { name: 'RO + Minerals + Copper', price: 16999 },
    ],
    includedItems: 'Stand, Cover, Pre-filter, Installation',
  },
  {
    id: 'aqua-oyster',
    name: 'Aqua Oyster',
    image: 'assets/products/4.avif',
    colorImages: [],
    category: 'domestic-water-purifiers',
    descriptionList: [
      'Production capacity - 15 LPH',
      'Tank capacity - 8 L',
      'Dual-tone under-counter design',
      'ABS plastic construction',
      '8 liters storage',
      'LED indicator',
      'Auto on/off',
    ],
    variants: [
      { name: 'RO + Minerals', price: 10999 },
      { name: 'RO + Minerals + Alkaline', price: 11999 },
      { name: 'RO + Minerals + Copper', price: 11999 },
    ],
    includedItems: 'Stand, Cover, Pre-filter, Installation',
  },
];

export const DEFAULT_CATEGORIES = [
  { id: 'multibrand-water-purifiers',       name: 'Multibrand Water Purifiers' },
  { id: 'domestic-water-purifiers',          name: 'Domestic Water Purifiers' },
  { id: 'industrial-commercial-ro-plants',   name: 'Industrial and Commercial RO Plants' },
  { id: 'water-softener-plant',              name: 'Water Softener Plant' },
  { id: 'iron-removal-plant',                name: 'Iron Removal Plant' },
  { id: 'water-conditioner',                 name: 'Water Conditioner' },
  { id: 'sand-filter',                       name: 'Sand Filter' },
  { id: 'automatic-level-controller',        name: 'Automatic Level Controller' },
];

/* Keep old export names for backward compatibility */
export const PRODUCTS   = DEFAULT_PRODUCTS;
export const CATEGORIES = DEFAULT_CATEGORIES;

/* Live data — populated by initProducts() */
let _products   = DEFAULT_PRODUCTS;
let _categories = DEFAULT_CATEGORIES;

/**
 * Fetch live data from the PHP API.
 * Call this once before rendering any product components.
 */
export async function initProducts() {
  try {
    const [pr, cr] = await Promise.all([
      fetch('api/products.php'),
      fetch('api/categories.php'),
    ]);
    if (pr.ok) {
      const data = await pr.json();
      if (Array.isArray(data) && data.length) _products = data;
    }
    if (cr.ok) {
      const data = await cr.json();
      if (Array.isArray(data) && data.length) _categories = data;
    }
  } catch {
    /* PHP not available — silently fall back to defaults */
  }
}

export function getAllProducts()   { return _products; }
export function getAllCategories() { return _categories; }

export function findProductById(id) {
  return _products.find((p) => p.id === id);
}

export function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}.00`;
}

/* A product's colors are photo-only choices, shared across every variant —
   they never change price. Variants (RO / RO+Alkaline / RO+Copper) only
   ever change the price; picking one never touches the photo.
   Back-compat: older records may have colors nested under the first
   variant, or a flat `images` array / single `image` string there instead
   of a product-level `colors` list. */
export function productColors(product) {
  if (product?.colors?.length) return product.colors;
  const firstVariant = product?.variants?.[0];
  if (firstVariant?.colors?.length) return firstVariant.colors;
  if (firstVariant?.images?.length) return firstVariant.images.map((img) => ({ name: '', image: img }));
  if (firstVariant?.image) return [{ name: '', image: firstVariant.image }];
  return [{ name: '', image: product.image }];
}

export function startingPrice(product) {
  return product.variants?.[0]?.price ?? 0;
}
