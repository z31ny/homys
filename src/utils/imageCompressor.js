/**
 * Client-side Image Compressor using HTML Canvas API.
 * Resizes images to maximum dimensions and compresses to WebP / JPEG before upload.
 */

/**
 * Compress an image File object.
 * @param {File} file - Original file object from input
 * @param {Object} options - Compression settings
 * @param {number} [options.maxWidth=1920] - Maximum width
 * @param {number} [options.maxHeight=1920] - Maximum height
 * @param {number} [options.quality=0.82] - Compression quality (0-1)
 * @param {string} [options.mimeType='image/webp'] - Output MIME type
 * @returns {Promise<File>} Compressed File object
 */
export async function compressImage(file, options = {}) {
  // If not an image, return original file
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    mimeType = 'image/webp',
  } = options;

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Fallback to original if blob creation fails
              return;
            }

            // Construct new compressed File object
            const ext = mimeType === 'image/webp' ? 'webp' : 'jpg';
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'upload';
            const compressedName = `${baseName}.${ext}`;

            const compressedFile = new File([blob], compressedName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            console.log(`📸 Compressed "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) → "${compressedFile.name}" (${(compressedFile.size / 1024).toFixed(0)} KB)`);
            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
