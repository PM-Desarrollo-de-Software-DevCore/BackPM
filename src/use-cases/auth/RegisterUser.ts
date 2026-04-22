import bcrypt from "bcrypt"
import { saveUser, findUserByEmail } from "../../infrastructure/repositories/UserRepository"
import { GlobalRole } from "../../entities/User"


export const registerUser = async (email: string, password: string, name: string, lastname: string, globalRole: GlobalRole) => {

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
        globalRole
    })

    return  { id: user.id, email: user.email, name: user.name, lastname: user.lastname, role: user.globalRole }
}