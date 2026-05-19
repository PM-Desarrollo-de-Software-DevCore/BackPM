import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarPointsUsuario1779204799188 implements MigrationInterface {
    name = 'AgregarPointsUsuario1779204799188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "points" int NOT NULL CONSTRAINT "DF_cdee031d891aee137fb0028767a" DEFAULT 0`);

        await queryRunner.query(`
            UPDATE u
            SET u."points" = ISNULL(t.cnt, 0) * 10
            FROM "users" u
            LEFT JOIN (
                SELECT "assignedTo", COUNT(*) AS cnt
                FROM "task"
                WHERE "status" = 'completed' AND "assignedTo" IS NOT NULL
                GROUP BY "assignedTo"
            ) t ON t."assignedTo" = u."id"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_cdee031d891aee137fb0028767a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "points"`);
    }

}
