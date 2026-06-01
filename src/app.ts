import express from "express"
import cors from "cors"
import { AppDataSource } from "./infrastructure/db/DataSource"
import authRoutes from "./routes/authRoutes"
import projectRoutes from "./routes/projectRoutes"
import userRoutes from "./routes/userRoutes"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"
import { PORT } from "./config/env"
import memberRoutes from "./routes/memberRoutes"
import sprintRoutes from "./routes/sprintRoutes"
import { projectTaskRouter, sprintTaskRouter, taskRouter } from "./routes/taskRoutes"
import { projectMilestoneRouter, milestoneRouter } from "./routes/milestoneRoutes"
import { projectProgressEntryRouter, progressEntryRouter } from "./routes/progressEntryRoutes"
import { taskCommentRouter, commentRouter } from "./routes/commentRoutes"
import { taskTimeEntryRouter, timeEntryRouter, projectTimeEntryRouter } from "./routes/timeEntryRoutes"
import { projectExpenseRouter, expenseRouter } from "./routes/expenseRoutes"
import { userTechnologyRouter, technologyRouter } from "./routes/userTechnologyRoutes"
import dashboardRoutes from "./routes/dashboardRoutes"
import { leaderboardRouter, projectLeaderboardRouter } from "./routes/leaderboardRoutes"
import recommendationRoutes from "./routes/recommendationRoutes"
import notificationRoutes from "./routes/notificationRoutes"
import profileChangeRequestRoutes from "./routes/profileChangeRequestRoutes"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/projects", projectRoutes)
app.use("/projects", memberRoutes)
app.use("/projects", sprintRoutes)  // Cambiar esta línea
app.use("/projects", projectTaskRouter)
app.use("/sprints", sprintRoutes)
app.use("/sprints", sprintTaskRouter)
app.use("/tasks", taskRouter)
app.use("/projects", projectMilestoneRouter)
app.use("/milestones", milestoneRouter)
app.use("/projects", projectProgressEntryRouter)
app.use("/progress-entries", progressEntryRouter)
app.use("/tasks", taskCommentRouter)
app.use("/comments", commentRouter)
app.use("/tasks", taskTimeEntryRouter)
app.use("/time-entries", timeEntryRouter)
app.use("/projects", projectTimeEntryRouter)
app.use("/projects", projectExpenseRouter)
app.use("/expenses", expenseRouter)
app.use("/users", userRoutes)
app.use("/users", userTechnologyRouter)
app.use("/technologies", technologyRouter)
app.use("/dashboard", dashboardRoutes)
app.use("/leaderboard", leaderboardRouter)
app.use("/projects", projectLeaderboardRouter)
app.use("/recommendations", recommendationRoutes)
app.use("/notifications", notificationRoutes)
app.use("/profile-change-requests", profileChangeRequestRoutes)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

AppDataSource.initialize()
    .then(() => {
        console.log("Base de datos conectada")
        app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))
    })
    .catch((error) => console.log("Error conectando la DB:", error))