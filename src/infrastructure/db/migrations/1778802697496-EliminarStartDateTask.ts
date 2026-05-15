import { MigrationInterface, QueryRunner } from "typeorm";

export class EliminarStartDateTask1778802697496 implements MigrationInterface {
    name = 'EliminarStartDateTask1778802697496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "start_date"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "start_date" datetime2 NOT NULL`);
    }

}
