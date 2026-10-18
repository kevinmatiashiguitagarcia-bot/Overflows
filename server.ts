import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  sendOfficialVerificationEmail,
  verifyStoredCode,
  OFFICIAL_ADMIN_EMAIL
} from './src/server/mailService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON Body Parser
  app.use(express.json());

  // -------------------------------------------------------------
  // API: Health & Mail Config Information
  // -------------------------------------------------------------
  app.get('/api/mail-config', (_req: Request, res: Response) => {
    res.json({
      status: 'configured',
      officialSender: OFFICIAL_ADMIN_EMAIL,
      platform: 'InfoHeist - Overflows Altavista'
    });
  });

  // -------------------------------------------------------------
  // API: Send Verification Code to User's Email
  // -------------------------------------------------------------
  app.post('/api/send-verification-code', async (req: Request, res: Response) => {
    try {
      const { email, purpose, userName } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Por favor proporciona un correo electrónico válido.'
        });
      }

      const trimmedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de correo electrónico inválido. Ejemplo: usuario@ejemplo.com'
        });
      }

      // Generate cryptographically secure 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Dispatch official email from overflowsoficial01@gmail.com
      const mailResult = await sendOfficialVerificationEmail({
        toEmail: trimmedEmail,
        code,
        purpose: purpose || 'password_reset',
        userName
      });

      // Crucial: Respond to client WITHOUT exposing the 6-digit code in the response
      return res.json({
        success: true,
        message: mailResult.message || `Hemos enviado un código de verificación de 6 dígitos a ${trimmedEmail}.`,
        targetEmail: trimmedEmail
      });
    } catch (error: unknown) {
      console.error('[API ERROR] Failed to send verification code:', error);
      return res.status(500).json({
        success: false,
        error: 'Ocurrió un error al procesar el envío del correo de verificación. Por favor intenta nuevamente.'
      });
    }
  });

  // -------------------------------------------------------------
  // API: Verify 6-digit Code
  // -------------------------------------------------------------
  app.post('/api/verify-code', (req: Request, res: Response) => {
    try {
      const { email, code, purpose } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          error: 'Correo y código de verificación son requeridos.'
        });
      }

      const result = verifyStoredCode(email, String(code).trim(), purpose);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Código de verificación inválido o expirado.'
        });
      }

      return res.json({
        success: true,
        message: 'Código verificado con éxito.'
      });
    } catch (error: unknown) {
      console.error('[API ERROR] Verification failed:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno al validar el código de seguridad.'
      });
    }
  });

  // -------------------------------------------------------------
  // Mount Vite middleware in Development, Serve static files in Prod
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[INFOHEIST OVERFLOWS] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[MAIL SERVICE] Official Sender Account: ${OFFICIAL_ADMIN_EMAIL}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
