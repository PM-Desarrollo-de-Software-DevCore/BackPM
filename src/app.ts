import express from "express";
import { AppDataSource } from "./infrastructure/db/DataSource";
import authRoutes from "./routes/authRoutes"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"
import { PORT } from "./config/env"

const app = express()
app.use(express.json())
app.use("/auth", authRoutes)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

AppDataSource.initialize()
    .then(() => {
        console.log("Base de datos conectada")
        app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))    })
    .catch((error) => console.log("Error conectando la DB:", error))