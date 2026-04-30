import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { findUserByEmail } from "../../infrastructure/repositories/UserRepository"
import { JWT_SECRET } from "../../config/env"

export const loginUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email)
    if (!user) throw new Error("El usuario no se encontro")
    
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) throw new Error("El password no es valido")

    const token = jwt.sign({ id: user.id}, JWT_SECRET, { expiresIn: "8h" })

    return  { token }
}

