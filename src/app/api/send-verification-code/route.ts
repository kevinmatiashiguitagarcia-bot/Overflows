import {
  sendOfficialVerificationEmail,
  OFFICIAL_ADMIN_EMAIL
} from '../../../server/mailService';

/**
 * Next.js App Router Route Handler (POST /api/send-verification-code)
 * Sends encrypted 6-digit verification code from overflowsoficial01@gmail.com
 * Never exposes the code in the response body.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, purpose, userName } = body;

    if (!email || typeof email !== 'string') {
      return Response.json(
        {
          success: false,
          error: 'Por favor proporciona un correo electrónico válido.'
        },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return Response.json(
        {
          success: false,
          error: 'Formato de correo electrónico inválido. Ejemplo: usuario@ejemplo.com'
        },
        { status: 400 }
      );
    }

    // Generate secure 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Send email from official administrator account
    const mailResult = await sendOfficialVerificationEmail({
      toEmail: trimmedEmail,
      code,
      purpose: purpose || 'password_reset',
      userName
    });

    // CRITICAL: The 6-digit code is NEVER returned in the JSON response
    return Response.json({
      success: true,
      message: mailResult.message || `Código de verificación de 6 dígitos enviado a ${trimmedEmail}.`,
      targetEmail: trimmedEmail,
      sender: OFFICIAL_ADMIN_EMAIL
    });
  } catch (error) {
    console.error('[NEXT.JS API ERROR] Failed to send verification email:', error);
    return Response.json(
      {
        success: false,
        error: 'Ocurrió un error al procesar el envío del correo de verificación. Por favor intenta nuevamente.'
      },
      { status: 500 }
    );
  }
}
