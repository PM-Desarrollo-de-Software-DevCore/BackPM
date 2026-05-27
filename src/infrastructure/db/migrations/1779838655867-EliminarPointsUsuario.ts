import { MigrationInterface, QueryRunner } from "typeorm";

export class EliminarPointsUsuario1779838655867 implements MigrationInterface {
    name = 'EliminarPointsUsuario1779838655867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Retira el contador de gamificacion users.points (reemplazado por el
        // leaderboard dinamico de story points en PM-94). En MSSQL hay que dropear
        // primero su constraint DEFAULT; el nombre fue verificado contra
        // sys.default_constraints en la BD.
        //
        // Nota: migration:generate tambien sugirio dropear columnas de "projects"
        // (client, methodology, budget, etc.) y el DEFAULT de task_number; eso es
        // drift porque la BD compartida va adelante de esta rama. Se omite a proposito.
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_cdee031d891aee137fb0028767a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "points"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "points" int NOT NULL CONSTRAINT "DF_cdee031d891aee137fb0028767a" DEFAULT 0`);
    }

}
