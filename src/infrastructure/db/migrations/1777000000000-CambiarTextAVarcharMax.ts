import { MigrationInterface, QueryRunner } from "typeorm";

export class CambiarTextAVarcharMax1777000000000 implements MigrationInterface {
    name = "CambiarTextAVarcharMax1777000000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "description" varchar(MAX) NULL`)
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "description" varchar(MAX) NULL`)
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "comment" varchar(MAX) NOT NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "comment" text NOT NULL`)
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "description" text NULL`)
        await queryRunner.query(`ALTER TABLE "projects" ALTER COLUMN "description" text NULL`)
    }
}
