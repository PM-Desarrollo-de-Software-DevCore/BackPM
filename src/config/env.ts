// Sirve para poder acceder a las variables de entorno
if (process.env.NODE_ENV !== "production") {
    import("dotenv").then(dotenv => dotenv.config())
}

// Nos traemos las variables de entorno para que se puedan acceder en el codigo
export const DB_HOST = process.env.DB_HOST!
export const DB_PORT = Number(process.env.DB_PORT)
export const DB_USER = process.env.DB_USER!
export const DB_PASSWORD = process.env.DB_PASSWORD!
export const DB_NAME = process.env.DB_NAME!
export const JWT_SECRET = process.env.JWT_SECRET!
export const PORT = process.env.PORT || 3000
