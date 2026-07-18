/**
 * Base URL for pre-optimized static images.
 * Set VITE_STATIC_URL in .env to point to your R2 bucket's public URL.
 * Falls back to the old Cloudinary CDN so the site works during migration.
 */
const BASE = import.meta.env.VITE_STATIC_URL || '';

const CLOUDINARY_FALLBACK = 'https://res.cloudinary.com/dzpswgjsm/image/upload';

/**
 * Returns the URL for a static asset.
 * When VITE_STATIC_URL is set, serves from R2: {BASE}/static/{name}
 * When unset, falls back to Cloudinary with the given transforms.
 */
export function staticUrl(name, cloudinaryTransforms = 'f_auto,q_auto,w_1920') {
  if (BASE) return `${BASE}/static/${name}`;
  return `${CLOUDINARY_FALLBACK}/${cloudinaryTransforms}/homys-static/${name}`;
}
