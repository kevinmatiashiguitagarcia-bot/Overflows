/**
 * Vision AI & NLP Moderation Utility for Citizen Reports
 * InfoHeist Platform - Community Early Warning System (OVERFLOWS)
 */

export interface ImageValidationResult {
  isValid: boolean;
  isFaceDetected: boolean;
  isHydrologicalEnvironment: boolean;
  errorMessage?: string;
  confidence?: number;
}

export interface TextModerationResult {
  isClean: boolean;
  vulgarWordsFound: string[];
  isAmbiguousOrSpam: boolean;
  requiresSpecialReview: boolean;
  feedbackMessage?: string;
}

export const EXACT_AI_IMAGE_REJECTION_MSG =
  'Imagen no coincide: El archivo adjunto contiene rostros, objetos o elementos ajenos al entorno hidrológico';

export const EXACT_AI_IMAGE_REJECTION_MSG_EN =
  'Image mismatch: The attached file contains faces, personal objects, or elements unrelated to the hydrological environment';

/**
 * List of vulgar / offensive terms in Spanish and regional Colombian slang.
 */
const VULGAR_TERMS = [
  'hijueputa',
  'hijadeputa',
  'hijodeputa',
  'hputa',
  'hp',
  'gonorrea',
  'mierda',
  'mierdita',
  'malparido',
  'malparida',
  'carechimba',
  'chimba',
  'puta',
  'puto',
  'putica',
  'marica',
  'maricon',
  'maricón',
  'perra',
  'perro hpta',
  'idiota',
  'imbecil',
  'imbécil',
  'estupido',
  'estúpido',
  'estupida',
  'estúpida',
  'pendejo',
  'pendeja',
  'culiao',
  'culicagao',
  'coño',
  'verga',
  'careverga',
  'mamaguevo',
  'caremonda',
  'monda',
  'malparidos',
  'gonorreas',
  'zorra',
  'pirobo',
  'piroba',
  'careverga',
  'carechimba',
  'hptas',
  'malparidas'
];

/**
 * Relevant hydrological, territorial, environmental, and infrastructure keywords.
 */
const HYDROLOGICAL_KEYWORDS = [
  'agua',
  'aguas',
  'nivel',
  'cauce',
  'rio',
  'río',
  'quebrada',
  'quebradas',
  'puente',
  'puentes',
  'muro',
  'muros',
  'lluvia',
  'lluvias',
  'creciente',
  'crecientes',
  'lodo',
  'barro',
  'sedimento',
  'sedimentos',
  'piedra',
  'piedras',
  'roca',
  'rocas',
  'palizada',
  'empalizada',
  'ramas',
  'arbol',
  'árbol',
  'arboles',
  'árboles',
  'basura',
  'desborde',
  'desbordamiento',
  'desbordada',
  'desbordado',
  'inundacion',
  'inundación',
  'talud',
  'taludes',
  'ladera',
  'laderas',
  'flujo',
  'corriente',
  'canal',
  'canalizado',
  'box-culvert',
  'box culvert',
  'alcantarilla',
  'vía',
  'via',
  'carretera',
  'calle',
  'estribo',
  'estribos',
  'tranquilo',
  'tranquila',
  'normal',
  'calma',
  'estable',
  'subiendo',
  'sube',
  'bajando',
  'baja',
  'aumento',
  'alerta',
  'precaucion',
  'precaución',
  'emergencia',
  'sector',
  'vereda',
  'casa',
  'vivienda',
  'residencia',
  'riesgo',
  'orilla',
  'margen',
  'cuenca',
  'cota',
  'caudal',
  'turbia',
  'turbio',
  'espuma'
];

/**
 * Normalizes text for NLP analysis (lowercase, strips accents and punctuation).
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates text for profanity, spam, and ambiguity.
 * If ambiguous or lacking clear context, flags for special review at overflowsoficial01@gmail.com.
 */
export function validateReportTextNLP(text: string): TextModerationResult {
  const trimmed = text.trim();
  const normalized = normalizeText(trimmed);
  const words = normalized.split(/\s+/).filter(Boolean);

  // 1. Profanity / Vulgar terms check
  const vulgarWordsFound: string[] = [];
  for (const term of VULGAR_TERMS) {
    const termNormalized = normalizeText(term);
    const regex = new RegExp(`\\b${termNormalized}\\b`, 'i');
    if (regex.test(normalized)) {
      vulgarWordsFound.push(term);
    }
  }

  if (vulgarWordsFound.length > 0) {
    return {
      isClean: false,
      vulgarWordsFound,
      isAmbiguousOrSpam: false,
      requiresSpecialReview: false,
      feedbackMessage:
        'No se permite lenguaje vulgar u ofensivo en los reportes comunitarios. Por favor describe las condiciones del cauce de forma constructiva y respetuosa.'
    };
  }

  // 2. Ambiguity & Spam Check
  const isTooShort = trimmed.length < 10;
  const isKeyboardSmash = /(.)\1{4,}/.test(trimmed); // 5 or more identical consecutive characters
  const isMeaninglessPattern = /^([a-z0-9])\1+$/i.test(trimmed.replace(/\s/g, ''));

  // Count domain keywords
  const matchedKeywords = HYDROLOGICAL_KEYWORDS.filter((kw) => {
    const normKw = normalizeText(kw);
    return words.includes(normKw) || normalized.includes(normKw);
  });

  const hasHydrologicalContext = matchedKeywords.length > 0;
  const wordCount = words.length;

  // Ambiguous, extremely vague or spam-like
  const isAmbiguousOrSpam =
    isTooShort ||
    isKeyboardSmash ||
    isMeaninglessPattern ||
    (wordCount < 4 && !hasHydrologicalContext);

  if (isAmbiguousOrSpam) {
    return {
      isClean: true,
      vulgarWordsFound: [],
      isAmbiguousOrSpam: true,
      requiresSpecialReview: true,
      feedbackMessage:
        'La redacción es ambigua o presenta escaso detalle. El reporte se remitirá automáticamente a revisión administrativa (overflowsoficial01@gmail.com) para verificación manual.'
    };
  }

  return {
    isClean: true,
    vulgarWordsFound: [],
    isAmbiguousOrSpam: false,
    requiresSpecialReview: false
  };
}

/**
 * Extracts a frame from a video File/Blob and returns an HTMLCanvasElement
 */
async function extractVideoFrame(videoFile: File | Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;

    video.onloadeddata = () => {
      // Seek to 0.5s to get a valid frame
      video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      URL.revokeObjectURL(objectUrl);
      resolve(canvas);
    };

    video.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    // Timeout safety
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      resolve(canvas);
    }, 4000);
  });
}

/**
 * Analyzes an image canvas for human faces, text documents/screenshots,
 * personal objects, and valid hydrological environments (creek, river, slope, rocks, bridge).
 */
function analyzeCanvasPixels(
  canvas: HTMLCanvasElement,
  hasFaceDetectedByAPI: boolean
): ImageValidationResult {
  if (hasFaceDetectedByAPI) {
    return {
      isValid: false,
      isFaceDetected: true,
      isHydrologicalEnvironment: false,
      errorMessage: EXACT_AI_IMAGE_REJECTION_MSG
    };
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || canvas.width === 0 || canvas.height === 0) {
    return {
      isValid: true,
      isFaceDetected: false,
      isHydrologicalEnvironment: true
    };
  }

  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let totalPixels = 0;
  let skinLikePixels = 0;
  let centralSkinPixels = 0;
  let waterTealBluePixels = 0;
  let natureGreenPixels = 0;
  let earthBrownMudPixels = 0;
  let stoneGrayPixels = 0;
  let whiteBlankPixels = 0;
  let darkDeepWaterPixels = 0;

  const centralXMin = Math.floor(width * 0.22);
  const centralXMax = Math.floor(width * 0.78);
  const centralYMin = Math.floor(height * 0.18);
  const centralYMax = Math.floor(height * 0.82);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      totalPixels++;

      // Pure/Near-white check (documents, text screenshots, blank walls)
      if (r > 240 && g > 240 && b > 240) {
        whiteBlankPixels++;
      }

      // Skin Chromaticity Check (Human Face / Selfie rejection)
      const isSkin =
        r > 95 &&
        g > 40 &&
        b > 20 &&
        r - g > 15 &&
        r > b &&
        r - b > 15 &&
        Math.max(r, g, b) - Math.min(r, g, b) > 15;

      if (isSkin) {
        skinLikePixels++;
        if (x >= centralXMin && x <= centralXMax && y >= centralYMin && y <= centralYMax) {
          centralSkinPixels++;
        }
      }

      // Environmental Category 1: Water / Streams / Currents (blues, teals, foam, river tones)
      const isWater =
        (b > r && b > g * 0.92 && b > 55) ||
        (g > r * 1.05 && b > r * 1.05 && Math.abs(g - b) < 45) ||
        (r > 65 && r < 145 && g > 75 && g < 155 && b > 85 && b < 170);

      if (isWater) waterTealBluePixels++;

      // Environmental Category 2: Nature / Riverbank Flora / Slopes (vegetation, trees)
      const isGreenery = g > r * 1.12 && g > b * 1.12 && g > 40;
      if (isGreenery) natureGreenPixels++;

      // Environmental Category 3: Earth, Mud, Ravine Soil, Sand (browns, ochres)
      const isEarth =
        r > 55 &&
        r < 185 &&
        g > 35 &&
        g < 145 &&
        b < g &&
        r > g &&
        r - b > 20;

      if (isEarth) earthBrownMudPixels++;

      // Environmental Category 4: River stones, masonry, bridge abutments, concrete canal
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      const isStoneGray = maxDiff < 20 && r > 35 && r < 215;
      if (isStoneGray) stoneGrayPixels++;

      // Environmental Category 5: Deep water / ravine shadow
      if (r < 45 && g < 55 && b < 65) {
        darkDeepWaterPixels++;
      }
    }
  }

  const skinRatio = skinLikePixels / totalPixels;
  const centralPixelsCount = (centralXMax - centralXMin) * (centralYMax - centralYMin);
  const centralSkinRatio = centralSkinPixels / Math.max(1, centralPixelsCount);

  // If face / selfie detected
  if (centralSkinRatio > 0.28 || skinRatio > 0.35) {
    return {
      isValid: false,
      isFaceDetected: true,
      isHydrologicalEnvironment: false,
      errorMessage: EXACT_AI_IMAGE_REJECTION_MSG
    };
  }

  // Environmental elements ratio
  const environmentalPixels =
    waterTealBluePixels +
    natureGreenPixels +
    earthBrownMudPixels +
    stoneGrayPixels +
    darkDeepWaterPixels;

  const environmentalRatio = environmentalPixels / totalPixels;
  const whiteBlankRatio = whiteBlankPixels / totalPixels;

  // If image is a screenshot, document, text page, indoor object, or lacks hydrological cues
  if (whiteBlankRatio > 0.65 || environmentalRatio < 0.22) {
    return {
      isValid: false,
      isFaceDetected: false,
      isHydrologicalEnvironment: false,
      errorMessage: EXACT_AI_IMAGE_REJECTION_MSG
    };
  }

  return {
    isValid: true,
    isFaceDetected: false,
    isHydrologicalEnvironment: true,
    confidence: Math.min(0.98, environmentalRatio + 0.3)
  };
}

/**
 * Validates that an image or video depicts an outdoor hydrological environment
 * and DOES NOT contain a human face / selfie, personal object, written text, etc.
 * Shows the exact prompt message upon mismatch:
 * "Imagen no coincide: El archivo adjunto contiene rostros, objetos o elementos ajenos al entorno hidrológico"
 */
export async function validateReportEnvironmentImage(
  fileOrUrl: File | Blob | string
): Promise<ImageValidationResult> {
  // If it's a video file, extract frame and validate
  if (
    fileOrUrl instanceof File &&
    (fileOrUrl.type.startsWith('video') || fileOrUrl.name.endsWith('.mp4') || fileOrUrl.name.endsWith('.mov'))
  ) {
    try {
      const videoCanvas = await extractVideoFrame(fileOrUrl);
      return analyzeCanvasPixels(videoCanvas, false);
    } catch (e) {
      console.warn('Video frame extraction failed, falling back to permissive:', e);
      return {
        isValid: true,
        isFaceDetected: false,
        isHydrologicalEnvironment: true
      };
    }
  }

  // Standard Image Validation
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrlToRevoke: string | null = null;
    if (typeof fileOrUrl !== 'string') {
      objectUrlToRevoke = URL.createObjectURL(fileOrUrl);
      img.src = objectUrlToRevoke;
    } else {
      img.src = fileOrUrl;
    }

    img.onerror = () => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      resolve({
        isValid: false,
        isFaceDetected: false,
        isHydrologicalEnvironment: false,
        errorMessage: EXACT_AI_IMAGE_REJECTION_MSG
      });
    };

    img.onload = async () => {
      try {
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);

        // Native FaceDetector API check if available
        let hasNativeFace = false;
        if (typeof window !== 'undefined' && 'FaceDetector' in window) {
          try {
            // @ts-expect-error - Native FaceDetector API
            const detector = new window.FaceDetector({ maxDetectedFaces: 2, fastMode: false });
            const faces = await detector.detect(img);
            if (faces && faces.length > 0) {
              hasNativeFace = true;
            }
          } catch (e) {
            console.debug('Native FaceDetector fallback to canvas analysis', e);
          }
        }

        if (hasNativeFace) {
          resolve({
            isValid: false,
            isFaceDetected: true,
            isHydrologicalEnvironment: false,
            errorMessage: EXACT_AI_IMAGE_REJECTION_MSG
          });
          return;
        }

        // Canvas Pixel Analysis
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        const result = analyzeCanvasPixels(canvas, false);
        resolve(result);
      } catch (err) {
        console.error('Error during image validation:', err);
        resolve({
          isValid: true,
          isFaceDetected: false,
          isHydrologicalEnvironment: true
        });
      }
    };
  });
}
