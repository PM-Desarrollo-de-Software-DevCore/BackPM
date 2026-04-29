import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendResetPasswordEmail = async (email: string, resetToken: string) => {
  if (!resend) {
    throw new Error("RESEND_API_KEY no configurada. No se puede enviar email de reseteo.");
  }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    return await resend.emails.send({
        from: "onboarding@resend.dev",
    to: email,
    subject: "Resetea tu contraseña",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Solicitud de reseteo de contraseña</h2>
        <p>Haz click en el botón de abajo para resetear tu contraseña:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Resetear contraseña
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Este enlace expira en 1 hora. Si no solicitaste esto, ignora este email.
        </p>
      </div>
    `,
    })
}