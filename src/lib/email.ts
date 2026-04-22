import nodemailer from 'nodemailer'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function getSmtpTransport() {
  const { data: settings, error } = await supabaseAdmin
    .from('smtp_settings')
    .select('*')
    .single()

  if (error || !settings || !settings.is_verified) {
    return null
  }

  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465, // true for 465, false for other ports
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  })
}

export function buildEmailTemplate(options: {
  title: string
  greeting: string
  bodyLines: string[]
  ctaText?: string
  ctaUrl?: string
  footerText?: string
}): string {
  const { title, greeting, bodyLines, ctaText, ctaUrl, footerText } = options

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0a1e; font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <!-- Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #1a1a2e; border: 1px solid rgba(124, 58, 237, 0.2); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6d28d9, #ec4899); border-radius: 12px; padding: 10px 24px;">
                <span style="color: #ffffff; font-weight: 900; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">✦ SERVING BUILDER APP</span>
              </div>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 20px 0; letter-spacing: -0.5px;">${title}</h1>
              <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">${greeting}</p>
              
              ${bodyLines.map(line => `<p style="color: rgba(255, 255, 255, 0.7); font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">${line}</p>`).join('')}

              ${ctaText && ctaUrl ? `
                <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                  <tr>
                    <td align="center" style="border-radius: 14px; background: linear-gradient(135deg, #7c3aed, #ec4899);">
                      <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; font-weight: 800; color: #ffffff; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
                        ${ctaText}
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 30px;">
                <p style="color: rgba(255, 255, 255, 0.3); font-size: 12px; margin: 0; line-height: 1.5;">
                  ${footerText || 'Este email fue enviado automáticamente por el sistema. Si tienes alguna duda, contacta al administrador.'}
                </p>
                <p style="color: rgba(255, 255, 255, 0.2); font-size: 10px; margin: 10px 0 0 0; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                  © 2026 SERVING BUILDER APP
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; message: string }> {
  try {
    const transport = await getSmtpTransport()
    if (!transport) {
      return { success: false, message: 'SMTP no configurado o no verificado' }
    }

    const { data: settings } = await supabaseAdmin
      .from('smtp_settings')
      .select('*')
      .single()

    const info = await transport.sendMail({
      from: `"${settings.from_name}" <${settings.from_email}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    return { success: true, message: info.response }
  } catch (error: any) {
    console.error('Error enviando email:', error)
    return { success: false, message: error.message }
  }
}

export async function sendWelcomeEmail(options: {
  to: string
  firstName: string
  planName: string
  password?: string
  loginUrl: string
}): Promise<{ success: boolean; message: string }> {
  const { to, firstName, planName, password, loginUrl } = options

  const bodyLines = [
    `Tu plan **${planName}** ha sido activado exitosamente.`,
    password 
      ? `Tus credenciales de acceso son:<br><strong>Email:</strong> ${to}<br><strong>Contraseña:</strong> ${password}`
      : `Ya puedes acceder con tu cuenta existente (${to}).`,
    'Ya puedes acceder a todas las herramientas de IA incluidas en tu plan para empezar a crear contenido de alto impacto.'
  ]

  const html = buildEmailTemplate({
    title: '¡Bienvenido a SERVING BUILDER APP!',
    greeting: `Hola ${firstName},`,
    bodyLines,
    ctaText: 'Acceder al Portal',
    ctaUrl: loginUrl,
  })

  return sendEmail({
    to,
    subject: '¡Bienvenido a SERVING BUILDER APP! Tu acceso está listo',
    html
  })
}
