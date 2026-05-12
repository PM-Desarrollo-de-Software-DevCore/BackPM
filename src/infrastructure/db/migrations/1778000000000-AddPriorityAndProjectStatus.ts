import { MigrationInterface, QueryRunner } from "typeorm"

export class AddPriorityAndProjectStatus1778000000000 implements MigrationInterface {
    name = "AddPriorityAndProjectStatus1778000000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "projects"
            ADD "priority" varchar(20) NOT NULL CONSTRAINT "DF_projects_priority" DEFAULT 'medium'
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            DROP CONSTRAINT "CHK_497d1cb88723cdab4fc3ea7d5d_ENUM"
        `)

        await queryRunner.query(`
            UPDATE "projects"
            SET "status" = 'planning'
            WHERE "status" = 'active'
        `)

        await queryRunner.query(`
            UPDATE "projects"
            SET "status" = 'in_progress'
            WHERE "status" = 'paused'
        `)

        await queryRunner.query(`
            UPDATE "projects"
            SET "status" = 'completed'
            WHERE "status" = 'finished'
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            ADD CONSTRAINT "CHK_497d1cb88723cdab4fc3ea7d5d_ENUM"
            CHECK ("status" IN ('planning', 'in_progress', 'completed'))
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            DROP CONSTRAINT "DF_a27865a7be17886e3088f4a6509"
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            ADD CONSTRAINT "DF_a27865a7be17886e3088f4a6509"
            DEFAULT 'planning' FOR "status"
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "projects"
            DROP CONSTRAINT "DF_a27865a7be17886e3088f4a6509"
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            DROP CONSTRAINT "CHK_497d1cb88723cdab4fc3ea7d5d_ENUM"
        `)

        await queryRunner.query(`
            UPDATE "projects"
            SET "status" = 'active'
            WHERE "status" = 'planning'
        `)

        await queryRunner.query(`
            UPDATE "projects"
            SET "status" = 'paused'
            WHERE "status" = 'in_progress'
        `)

        await queryRunner.query(`
            UPDATE "projects"
            SET "status" = 'finished'
            WHERE "status" = 'completed'
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            ADD CONSTRAINT "CHK_497d1cb88723cdab4fc3ea7d5d_ENUM"
            CHECK ("status" IN ('active', 'finished', 'paused'))
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            ADD CONSTRAINT "DF_a27865a7be17886e3088f4a6509"
            DEFAULT 'active' FOR "status"
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            DROP CONSTRAINT "DF_projects_priority"
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            DROP COLUMN "priority"
        `)
    }
}