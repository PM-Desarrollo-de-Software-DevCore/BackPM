import crypto from "crypto"
import { findUserByEmail, updateResetToken } from "../../infrastructure/repositories/UserRepository"
import { sendResetPasswordEmail } from "../../infrastructure/services/email"

export const forgotPassword = async (email: string) => {
    const user = await findUserByEmail(email);

    if (!user) {
        return { success: true, message: "Si el email es correcto se envio un correo con el enlace de reseteo."};
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await updateResetToken(user.id, resetToken, resetTokenExpiry);
    await sendResetPasswordEmail(email, resetToken);

    return { success: true, message:"Se envio un email de reseteo a tu cuenta"};
}