import { verifyStoredCode } from '../../../server/mailService';

/**
 * Next.js App Router Route Handler (POST /api/verify-code)
 * Validates 6-digit verification code against the stored server record.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, purpose } = body;

    if (!email || !code) {
      return Response.json(
        {
          success: false,
          error: 'Correo y código de verificación son requeridos.'
        },
        { status: 400 }
      );
    }

    const result = verifyStoredCode(email, String(code).trim(), purpose);

    if (!result.valid) {
      return Response.json(
        {
          success: false,
          error: result.error || 'Código de verificación inválido o expirado.'
        },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: 'Código verificado con éxito.'
    });
  } catch (error) {
    console.error('[NEXT.JS API ERROR] Failed to verify code:', error);
    return Response.json(
      {
        success: false,
        error: 'Error interno al validar el código de seguridad.'
      },
      { status: 500 }
    );
  }
}
