import imageCompression from 'browser-image-compression';

/**
 * Standardizes and compresses images for the web.
 * - Converts to WebP for better compression.
 * - Enforces a 4:3 aspect ratio by cropping.
 * - Limits resolution to 1200x900 for fast loading.
 */
export const compressImage = async (file: File) => {
  try {
    // 1. Initial compression to handle very large files
    const initialOptions = {
      maxSizeMB: 2,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
    };
    const initialCompressed = await imageCompression(file, initialOptions);

    // 2. Standardize dimensions (4:3 Aspect Ratio) and convert to WebP using Canvas
    return new Promise<File>((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(initialCompressed);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(initialCompressed);
          return;
        }

        // Target: 1200x900 (4:3) - Good balance between quality and speed
        const targetWidth = 1200;
        const targetHeight = 900;
        const targetRatio = targetWidth / targetHeight;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > targetRatio) {
          // Image is wider than 4:3
          drawHeight = img.height;
          drawWidth = img.height * targetRatio;
          offsetX = (img.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller than 4:3
          drawWidth = img.width;
          drawHeight = img.width / targetRatio;
          offsetX = 0;
          offsetY = (img.height - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, targetWidth, targetHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            const finalFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(finalFile);
          } else {
            resolve(initialCompressed);
          }
        }, 'image/webp', 0.8); // 80% quality WebP is excellent
      };
      img.onerror = () => resolve(initialCompressed);
    });
  } catch (error) {
    console.error('Error standardizing image:', error);
    return file;
  }
};