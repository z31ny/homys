/**
 * Base URL for pre-optimized static images.
 * Set VITE_STATIC_URL in .env to point to your R2 bucket's public URL.
 * Falls back to the old Cloudinary CDN so the site works during migration.
 */
const BASE = import.meta.env.VITE_STATIC_URL || '';

const CLOUDINARY_FALLBACK = 'https://res.cloudinary.com/dzpswgjsm/image/upload';

/**
 * Returns the URL for a static asset.
 * Serves optimized WebP variant from R2 if VITE_STATIC_URL is configured.
 * @param {string} name - e.g. 'hero.png'
 * @param {string} [size] - 'sm' (480w), 'md' (960w), 'lg' (1600w), or undefined
 */
export function staticUrl(name, size = '') {
  if (BASE) {
    const extIdx = name.lastIndexOf('.');
    const baseName = extIdx !== -1 ? name.substring(0, extIdx) : name;
    const ext = extIdx !== -1 ? name.substring(extIdx) : '';
    
    if (size) {
      return `${BASE}/static/${baseName}_${size}.webp`;
    }
    // Default to .webp if available, fallback to original extension
    return `${BASE}/static/${baseName}.webp`;
  }
  return `${CLOUDINARY_FALLBACK}/f_auto,q_auto,w_1920/homys-static/${name}`;
}

/**
 * Transforms any image URL (e.g. property image from DB or R2) to an optimized WebP variant URL.
 * @param {string} url - Original image URL
 * @param {'sm'|'md'|'lg'|'webp'} [size] - Target size variant
 */
export function optimizedUrl(url, size = 'md') {
  if (!url || typeof url !== 'string') return url;

  // If it's an R2 URL (or relative path pointing to R2)
  if (BASE && url.includes(BASE)) {
    const extIdx = url.lastIndexOf('.');
    if (extIdx !== -1) {
      const basePath = url.substring(0, extIdx);
      const ext = url.substring(extIdx).toLowerCase();
      // Only transform png/jpg/jpeg/webp
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        // Remove existing size suffix if present
        const cleanBasePath = basePath.replace(/_(sm|md|lg)$/, '');
        if (size === 'sm') return `${cleanBasePath}_sm.webp`;
        if (size === 'md') return `${cleanBasePath}_md.webp`;
        if (size === 'lg') return `${cleanBasePath}_lg.webp`;
        return `${cleanBasePath}.webp`;
      }
    }
  }

  return url;
}

/**
 * Generates srcSet and sizes props for an <img> tag for responsive loading.
 * @param {string} url - Original image URL
 * @param {string} [defaultSizes] - CSS sizes string (e.g. "(max-width: 768px) 100vw, 50vw")
 */
export function responsiveProps(url, defaultSizes = '(max-width: 768px) 100vw, 50vw') {
  if (!url || typeof url !== 'string') {
    return { src: url };
  }

  const sm = optimizedUrl(url, 'sm');
  const md = optimizedUrl(url, 'md');
  const lg = optimizedUrl(url, 'lg');

  // If optimizedUrl returned a modified URL (meaning it's an R2 asset)
  if (sm !== url && sm.includes('_sm.webp')) {
    return {
      src: md, // Default fallback src for older browsers/tools
      srcSet: `${sm} 480w, ${md} 960w, ${lg} 1600w`,
      sizes: defaultSizes,
    };
  }

  return { src: url };
}

