import express from "express"
import cors from "cors"
import { AppDataSource } from "./infrastructure/db/DataSource"
import authRoutes from "./routes/authRoutes"
import projectRoutes from "./routes/projectRoutes"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"
import { PORT } from "./config/env"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/projects", projectRoutes)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

AppDataSource.initialize()
    .then(() => {
        console.log("Base de datos conectada")
        app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
    })
    .catch((error) => console.log("Error conectando la DB:", error))