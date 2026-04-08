import bcrypt from "bcrypt"
import { saveUser, findUserByEmail } from "../../infrastructure/repositories/UserRepository"
import { UserRole } from "../../entities/User"


export const registerUser = async (email: string, password: string, name: string, lastname: string, role: UserRole) => {

    // Se busca el email
    const existing = await findUserByEmail(email)
    if (existing) throw new Error("El email ya esta registrado")
    
    // Hashear contra
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await saveUser({
        email,
        password: hashedPassword,
        name,
        lastname,
        role,
    })

    return  { id: user.id, email: user.email, name: user.name, lastname: user.lastname, role: user.role }
}