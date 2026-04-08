import { Request, Response } from "express";
import { loginUser } from "../use-cases/auth/LoginUser";
import { registerUser } from "../use-cases/auth/RegisterUser";

export const loginController = async (req: Request, res: Response) => {
    try {
        const { email,password } = req.body
        const result = await loginUser(email, password)
        res.status(200).json({ success: true, data: result})
    } catch (error: any) {
        res.status(401).json({ success: false, message: error.message })
    }
}

export const registerController = async (req: Request, res: Response) => {
    try {
        const { email,password,name,lastname,role } = req.body
        const result = await registerUser(email, password, name, lastname, role)
        res.status(200).json({ success: true, data: result})
    } catch (error: any) {
        res.status(401).json({ success: false, message: error.message })
    }
}
