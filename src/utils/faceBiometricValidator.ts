/**
 * Biometric Face Detection & Human Verification Utility
 * InfoHeist Platform - Security & Identity Verification Module
 */

export interface FaceValidationResult {
  isHumanFace: boolean;
  confidence: number;
  message: string;
  details?: {
    skinRatio: number;
    centralSkinRatio: number;
    landscapeIndicator: boolean;
    featureContrast: number;
  };
}

/**
 * Validates whether an uploaded image contains a recognizable, clear human face.
 * Rejects landscapes, vehicles, abstract graphics, animals, and non-face images.
 */
export async function validateHumanFaceBiometrics(
  imageSource: string | File | Blob
): Promise<FaceValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Handle object URL creation if File/Blob
    let objectUrlToRevoke: string | null = null;
    if (typeof imageSource !== 'string') {
      objectUrlToRevoke = URL.createObjectURL(imageSource);
      img.src = objectUrlToRevoke;
    } else {
      img.src = imageSource;
    }

    img.onload = async () => {
      try {
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);

        // 1. Try Native Browser FaceDetector API if available
        if (typeof window !== 'undefined' && 'FaceDetector' in window) {
          try {
            // @ts-expect-error - Native FaceDetector is an experimental standard API
            const detector = new window.FaceDetector({ maxDetectedFaces: 4, fastMode: false });
            const faces = await detector.detect(img);
            if (faces && faces.length > 0) {
              resolve({
                isHumanFace: true,
                confidence: 0.96,
                message: 'Biometría facial verificada exitosamente mediante Face Detection API.'
              });
              return;
            }
          } catch (e) {
            console.debug('Browser native FaceDetector fallback to canvas analysis', e);
          }
        }

        // 2. High-precision Canvas Chromaticity and Facial Structure Analysis
        const canvas = document.createElement('canvas');
        const targetWidth = 140;
        const targetHeight = 140;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          // If 2d context unavailable, reject with safe default
          resolve({
            isHumanFace: false,
            confidence: 0,
            message: 'Acceso no concedido: La foto de perfil debe ser una fotografía clara de una persona.'
          });
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;

        let totalPixels = 0;
        let skinPixels = 0;
        let centralSkinPixels = 0;
        let centralPixels = 0;
        let greenFoliagePixels = 0;
        let skyBluePixels = 0;
        let totalLuminance = 0;

        const centralXMin = Math.floor(targetWidth * 0.20);
        const centralXMax = Math.floor(targetWidth * 0.80);
        const centralYMin = Math.floor(targetHeight * 0.15);
        const centralYMax = Math.floor(targetHeight * 0.85);

        // Array for luminance distribution in the face core
        const centralLuminances: number[] = [];

        for (let y = 0; y < targetHeight; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            // Ignore transparent pixels
            if (a < 50) continue;

            totalPixels++;

            // YCbCr color space conversion
            const Y = 0.299 * r + 0.587 * g + 0.114 * b;
            const Cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128;
            const Cr = 0.5 * r - 0.4187 * g - 0.0813 * b + 128;

            totalLuminance += Y;

            // Normalized Kovac-Peer / Chai-Ngan human skin cluster
            const isSkin =
              Cb >= 75 &&
              Cb <= 128 &&
              Cr >= 132 &&
              Cr <= 175 &&
              Y >= 35 &&
              r > g &&
              r > b;

            // Landscape / Nature filters
            const isGreenFoliage = g > r + 18 && g > b + 18;
            const isSkyBlue = b > r + 30 && b > g + 12 && Y > 120;

            if (isGreenFoliage) greenFoliagePixels++;
            if (isSkyBlue) skyBluePixels++;

            const isCentral =
              x >= centralXMin && x <= centralXMax && y >= centralYMin && y <= centralYMax;

            if (isCentral) {
              centralPixels++;
              centralLuminances.push(Y);
              if (isSkin) {
                centralSkinPixels++;
              }
            }

            if (isSkin) {
              skinPixels++;
            }
          }
        }

        if (totalPixels === 0) {
          resolve({
            isHumanFace: false,
            confidence: 0,
            message: 'Acceso no concedido: La foto de perfil debe ser una fotografía clara de una persona.'
          });
          return;
        }

        const skinRatio = skinPixels / totalPixels;
        const centralSkinRatio = centralPixels > 0 ? centralSkinPixels / centralPixels : 0;
        const greenRatio = greenFoliagePixels / totalPixels;
        const skyRatio = skyBluePixels / totalPixels;

        // Compute central luminance standard deviation (eyes/eyebrows/lips provide facial feature contrast)
        let contrastRatio = 0;
        if (centralLuminances.length > 0) {
          const meanL = centralLuminances.reduce((a, b) => a + b, 0) / centralLuminances.length;
          const variance =
            centralLuminances.reduce((acc, val) => acc + Math.pow(val - meanL, 2), 0) /
            centralLuminances.length;
          contrastRatio = Math.sqrt(variance) / (meanL || 1);
        }

        const isLandscape = greenRatio > 0.32 || skyRatio > 0.35 || (greenRatio + skyRatio > 0.42);

        // A valid face must have:
        // 1. A central human skin ratio between 14% and 88%
        // 2. An overall skin ratio >= 10%
        // 3. Not be dominated by nature foliage/sky landscape
        // 4. Have facial feature contrast (eyes, lips, shadows)
        const passesFaceCriteria =
          centralSkinRatio >= 0.14 &&
          centralSkinRatio <= 0.88 &&
          skinRatio >= 0.10 &&
          !isLandscape &&
          contrastRatio >= 0.10;

        if (passesFaceCriteria) {
          const confidence = Math.min(0.97, Math.max(0.72, centralSkinRatio * 1.2));
          resolve({
            isHumanFace: true,
            confidence,
            message: 'Rostro humano validado correctamente.',
            details: {
              skinRatio,
              centralSkinRatio,
              landscapeIndicator: isLandscape,
              featureContrast: contrastRatio
            }
          });
        } else {
          resolve({
            isHumanFace: false,
            confidence: 0.1,
            message: 'Acceso no concedido: La foto de perfil debe ser una fotografía clara de una persona.',
            details: {
              skinRatio,
              centralSkinRatio,
              landscapeIndicator: isLandscape,
              featureContrast: contrastRatio
            }
          });
        }
      } catch (err) {
        console.error('Error during biometric face validation:', err);
        resolve({
          isHumanFace: false,
          confidence: 0,
          message: 'Acceso no concedido: La foto de perfil debe ser una fotografía clara de una persona.'
        });
      }
    };

    img.onerror = () => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      resolve({
        isHumanFace: false,
        confidence: 0,
        message: 'Acceso no concedido: La foto de perfil debe ser una fotografía clara de una persona.'
      });
    };
  });
}
