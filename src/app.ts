import express from "express";
import { AppDataSource } from "./infrastructure/db/DataSource";
import authRoutes from "./routes/authRoutes"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"


const app = express()
app.use(express.json())
app.use("/auth", authRoutes)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))


AppDataSource.initialize()
    .then(() => {
        console.log("Base de datos conectada")
        app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"))
    })
    .catch((error) => console.log("Error conectando la DB:", error))