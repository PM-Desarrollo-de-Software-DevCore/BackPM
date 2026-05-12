import { MigrationInterface, QueryRunner } from "typeorm";

export class ReconciliarDriftConstraints1778603468962 implements MigrationInterface {
    name = 'ReconciliarDriftConstraints1778603468962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "DF_task_task_number"`);

        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "CHK_c33f6a9e5170d40bd0003c8d34_ENUM" CHECK ("priority" IN ('high','medium','low'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "CHK_c33f6a9e5170d40bd0003c8d34_ENUM"`);

        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "DF_task_task_number" DEFAULT 0 FOR "task_number"`);
    }
}
