// config/swagger.ts
import swaggerJsdoc from "swagger-jsdoc"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project Manager API",
      version: "1.0.0",
      description: "Documentación del backend"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/routes/*.ts"] // aquí lee los comentarios de tus rutas
}

export const swaggerSpec = swaggerJsdoc(options)