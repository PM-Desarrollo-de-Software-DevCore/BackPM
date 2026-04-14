import { Request, Response } from "express";
import { loginUser } from "../use-cases/auth/LoginUser";
import { registerUser } from "../use-cases/auth/RegisterUser";
import { getCurrentUser } from "../use-cases/auth/GetCurrentUser";
import { AuthenticatedRequest } from "../middlewares/requireAuth";
import { success } from "zod/v4";
import { forgotPassword } from "../use-cases/auth/ForgotPassword";
import { resetPassword } from "../use-cases/auth/ResetPassword";


export const loginController = async (req: Request, res: Response) => {
    try {
        const { email,password } = req.body
        const result = await loginUser(email, password)
        res.status(200).json({ success: true, data: result})
    } catch (error: any) {
        res.status(401).json({ success: false, message: error.message })
    }
};

export const registerController = async (req: Request, res: Response) => {
    try {
        const { email,password,name,lastname,role } = req.body
        const result = await registerUser(email, password, name, lastname, role)
        res.status(200).json({ success: true, data: result})
    } catch (error: any) {
        res.status(401).json({ success: false, message: error.message })
    }
};

export const meController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Token invalido" })
        }

        const result = await getCurrentUser(req.userId)
        res.status(200).json({ success: true, data: result })
    } catch (error: any) {
        res.status(401).json({ success: false, message: error.message })
    }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json ({ success: false, message: "Email es requerido"});
        }

        const result = await forgotPassword(email);
        res.status(200).json({ success: true, data: result})
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        const { resetToken, newPassword } = req.body;
        const result = await resetPassword(resetToken, newPassword);
        res.status(200).json({ succes: true, data: result });
    } catch (error: any){
        res.status(400).json({ success: false, message: error.message });
    }
};