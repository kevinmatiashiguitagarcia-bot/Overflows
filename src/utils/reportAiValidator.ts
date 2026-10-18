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
  'zorra'
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
  // Check for very short input or character repetition (e.g. "aaaa", "asdfasdf", "...")
  const isTooShort = trimmed.length < 12;
  const isKeyboardSmash = /(.)\1{4,}/.test(trimmed); // 5 or more identical consecutive characters
  const isMeaninglessPattern = /^([a-z0-9])\1+$/i.test(trimmed.replace(/\s/g, ''));

  // Count domain keywords
  const matchedKeywords = HYDROLOGICAL_KEYWORDS.filter((kw) => {
    const normKw = normalizeText(kw);
    return words.includes(normKw) || normalized.includes(normKw);
  });

  const hasHydrologicalContext = matchedKeywords.length > 0;
  const wordCount = words.length;

  // If text is extremely brief without hydrological context, or keyboard smash
  const isAmbiguousOrSpam = isTooShort || isKeyboardSmash || isMeaninglessPattern || (wordCount < 4 && !hasHydrologicalContext);

  if (isAmbiguousOrSpam) {
    return {
      isClean: true,
      vulgarWordsFound: [],
      isAmbiguousOrSpam: true,
      requiresSpecialReview: true,
      feedbackMessage:
        'La descripción es ambigua o presenta escaso detalle hidrológico. El reporte ha sido registrado con estado "Requiere revisión especial" y remitido al correo oficial de administración (overflowsoficial01@gmail.com) para análisis previo.'
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
 * Validates that an image depicts an outdoor hydrological environment
 * and DOES NOT contain a human face / selfie.
 */
export async function validateReportEnvironmentImage(
  imageSource: File | Blob | string
): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrlToRevoke: string | null = null;
    if (typeof imageSource !== 'string') {
      objectUrlToRevoke = URL.createObjectURL(imageSource);
      img.src = objectUrlToRevoke;
    } else {
      img.src = imageSource;
    }

    img.onerror = () => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
      resolve({
        isValid: false,
        isFaceDetected: false,
        isHydrologicalEnvironment: false,
        errorMessage: 'No se pudo procesar la imagen seleccionada. Por favor verifica el formato (JPG, PNG).'
      });
    };

    img.onload = async () => {
      try {
        if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);

        // 1. Face Detection: Check if Native FaceDetector is available
        if (typeof window !== 'undefined' && 'FaceDetector' in window) {
          try {
            // @ts-expect-error - Native FaceDetector
            const detector = new window.FaceDetector({ maxDetectedFaces: 2, fastMode: false });
            const faces = await detector.detect(img);
            if (faces && faces.length > 0) {
              resolve({
                isValid: false,
                isFaceDetected: true,
                isHydrologicalEnvironment: false,
                errorMessage:
                  'La fotografía contiene un rostro o selfie humano. Los reportes comunitarios deben registrar exclusivamente el entorno hidrológico: cauce, quebrada, empalizadas, laderas o infraestructura afectada.'
              });
              return;
            }
          } catch (e) {
            console.debug('Native FaceDetector fallback to canvas analysis', e);
          }
        }

        // 2. Canvas-based Multi-spectrum Analysis
        const canvas = document.createElement('canvas');
        const targetWidth = 160;
        const targetHeight = 160;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          // If 2d context unavailable, accept gracefully
          resolve({
            isValid: true,
            isFaceDetected: false,
            isHydrologicalEnvironment: true
          });
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
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

        const centralXMin = Math.floor(targetWidth * 0.25);
        const centralXMax = Math.floor(targetWidth * 0.75);
        const centralYMin = Math.floor(targetHeight * 0.20);
        const centralYMax = Math.floor(targetHeight * 0.80);

        for (let y = 0; y < targetHeight; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            totalPixels++;

            // Detect solid/blank white
            if (r > 245 && g > 245 && b > 245) {
              whiteBlankPixels++;
            }

            // Skin Chromaticity Check (to reject selfies / human face close-ups)
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

            // Environmental Color 1: Water / Streams / Reflections (blues, teals, river water)
            const isWater =
              (b > r && b > g * 0.95 && b > 60) || // cool blues/teals
              (g > r * 1.05 && b > r * 1.05 && Math.abs(g - b) < 45) || // murky greenish river water
              (r > 70 && r < 140 && g > 80 && g < 150 && b > 90 && b < 165); // turbid river tone

            if (isWater) waterTealBluePixels++;

            // Environmental Color 2: Nature / Riverbank Flora (greens, foliage)
            const isGreenery = g > r * 1.15 && g > b * 1.15 && g > 45;
            if (isGreenery) natureGreenPixels++;

            // Environmental Color 3: Earth, Mud, Riverbed Soil, Sand (browns, ochres)
            const isEarth =
              r > 60 &&
              r < 180 &&
              g > 40 &&
              g < 140 &&
              b < g &&
              r > g &&
              r - b > 25;
            if (isEarth) earthBrownMudPixels++;

            // Environmental Color 4: Stones, Concrete canalization, Rocks, Bridge masonry
            const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
            const isStoneGray = maxDiff < 18 && r > 40 && r < 210;
            if (isStoneGray) stoneGrayPixels++;

            // Environmental Color 5: Deep/dark water or shadows in ravine
            if (r < 45 && g < 55 && b < 65) {
              darkDeepWaterPixels++;
            }
          }
        }

        const skinRatio = skinLikePixels / totalPixels;
        const centralPixelsCount = (centralXMax - centralXMin) * (centralYMax - centralYMin);
        const centralSkinRatio = centralSkinPixels / centralPixelsCount;

        // If there's high concentration of human skin (selfie, portrait) -> REJECT
        if (centralSkinRatio > 0.35 || skinRatio > 0.40) {
          resolve({
            isValid: false,
            isFaceDetected: true,
            isHydrologicalEnvironment: false,
            errorMessage:
              'La imagen contiene un rostro o selfie humano. Los reportes comunitarios deben registrar exclusivamente el entorno hidrológico: cauces, niveles, empalizadas, laderas o infraestructura afectada.'
          });
          return;
        }

        // Check hydrological / outdoor environment score
        const environmentalPixels =
          waterTealBluePixels +
          natureGreenPixels +
          earthBrownMudPixels +
          stoneGrayPixels +
          darkDeepWaterPixels;

        const environmentalRatio = environmentalPixels / totalPixels;
        const whiteBlankRatio = whiteBlankPixels / totalPixels;

        // If image is mostly blank or has zero environmental colors (e.g. screenshot, indoor icon)
        if (whiteBlankRatio > 0.70 || environmentalRatio < 0.22) {
          resolve({
            isValid: false,
            isFaceDetected: false,
            isHydrologicalEnvironment: false,
            errorMessage:
              'La imagen no parece registrar un entorno hidrológico o cauce. Por favor adjunta una fotografía del río, quebrada, ladera, empalizada o puente.'
          });
          return;
        }

        resolve({
          isValid: true,
          isFaceDetected: false,
          isHydrologicalEnvironment: true,
          confidence: Math.min(0.98, environmentalRatio + 0.3)
        });
      } catch (err) {
        console.error('Error in environmental image validation:', err);
        // Fail-open for edge cases
        resolve({
          isValid: true,
          isFaceDetected: false,
          isHydrologicalEnvironment: true
        });
      }
    };
  });
}
