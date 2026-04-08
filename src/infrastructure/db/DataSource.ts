import "reflect-metadata"
import dotenv from "dotenv"
import { DataSource } from "typeorm";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "../../config/env";

export const AppDataSource = new DataSource({
    type: "mssql",
    host: DB_HOST,
    username: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: DB_NAME,
    synchronize: false,
    options: {
        encrypt: true,
        trustServerCertificate: false,
    },
    entities: ["src/infrastructure/db/entities/*.ts"],
    migrations: ["src/infrastructure/db/migrations/*.ts"]
})  

    