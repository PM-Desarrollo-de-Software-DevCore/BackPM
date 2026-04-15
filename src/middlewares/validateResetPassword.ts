import { Request, Response, NextFunction } from "express"
import { success } from "zod/v4";

export const validateResetPassword = (req: Request, res: Response, next: NextFunction) => {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "resetToken, newPassword y confirPassword son requeridos"
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "El password debe tener al menos 8 caracteres"
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Las contraseñas no coinciden"
        })
    }
}
