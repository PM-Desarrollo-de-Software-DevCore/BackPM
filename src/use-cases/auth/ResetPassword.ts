import bcrypt, { hash } from "bcrypt"
import { findUserByResetToken, clearResetToken, saveUser } from "../../infrastructure/repositories/UserRepository"
import { success } from "zod/v4";

export const resetPassword = async (resetToken: string, newPassword: string) => {

    const user = await findUserByResetToken(resetToken)

    if (!user || !user.resetTokenExpiry) {
        throw new Error ("Token de reseteo invalido o expirado");
    }

    if( new Date() > user.resetTokenExpiry) {
        throw new Error ("El token de reseteo ha expirado")
    }

    // Se hashea la nueva contrasena
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contra y limpiar token
    const updateUser = { ...user, password: hashedPassword };
    await saveUser(updateUser as any);
    await clearResetToken(user.id);

    return { success: true, message: "Contraseña reseteada exitosamente"};
}