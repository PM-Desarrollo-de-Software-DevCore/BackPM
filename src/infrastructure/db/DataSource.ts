import "reflect-metadata"
import { DataSource } from "typeorm";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "../../config/env";

const isCompiled = __dirname.includes("dist");

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
        trustServerCertificate: true,
    },
    // ✅ Usa .js en prod, .ts en dev
    entities: [isCompiled 
        ? __dirname + "/entities/*.js" 
        : "src/infrastructure/db/entities/*.ts"],
    migrations: [isCompiled 
        ? __dirname + "/migrations/*.js" 
        : "src/infrastructure/db/migrations/*.ts"],
})