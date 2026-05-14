import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarCompletedAtTask1778770584282 implements MigrationInterface {
    name = 'AgregarCompletedAtTask1778770584282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "completedAt" datetime2`);

        await queryRunner.query(`
            UPDATE "task"
            SET "completedAt" = COALESCE("end_date", "createdAt")
            WHERE "status" = 'completed' AND "completedAt" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "completedAt"`);
    }

}
