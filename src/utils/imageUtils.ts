import imageCompression from 'browser-image-compression';

/**
 * Standardizes and compresses images for the web.
 * - Converts to WebP for better compression.
 * - Enforces a 4:3 aspect ratio by cropping.
 * - Limits resolution to 1200x900 for fast loading.
 */
export const compressImage = async (file: File): Promise<File | Blob> => {
  try {
    // 1. Initial compression to handle very large files (e.g. 10MB+)
    // This helps prevent the browser from crashing when drawing to canvas
    const initialOptions = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    };
    
    let processedFile: File | Blob;
    try {
      processedFile = await imageCompression(file, initialOptions);
    } catch (e) {
      console.warn("Initial compression failed, using original file", e);
      processedFile = file;
    }

    // 2. Standardize dimensions (4:3 Aspect Ratio) and convert to WebP using Canvas
    return new Promise<File | Blob>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(processedFile);
      
      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanup();
            resolve(processedFile);
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
            cleanup();
            if (blob) {
              // Create a new file from the blob
              const fileName = file.name.split('.').slice(0, -1).join('.') || 'image';
              const finalFile = new File([blob], `${fileName}.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(finalFile);
            } else {
              resolve(processedFile);
            }
          }, 'image/webp', 0.8);
        } catch (e) {
          console.error("Canvas processing failed", e);
          cleanup();
          resolve(processedFile);
        }
      };

      img.onerror = (err) => {
        console.error("Image loading failed for canvas", err);
        cleanup();
        resolve(processedFile);
      };

      img.src = objectUrl;
    });
  } catch (error) {
    console.error('Error standardizing image:', error);
    return file;
  }
};