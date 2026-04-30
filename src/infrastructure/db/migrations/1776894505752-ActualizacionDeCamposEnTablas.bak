import { MigrationInterface, QueryRunner } from "typeorm";

export class ActualizacionDeCamposEnTablas1776894505752 implements MigrationInterface {
    name = 'ActualizacionDeCamposEnTablas1776894505752'

    public async up(queryRunner: QueryRunner): Promise<void> {

        // ========================
        // USERS
        // ========================
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);

        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD "globalRole" varchar(255) 
            CHECK(globalRole IN ('admin','user')) 
            NOT NULL DEFAULT 'user'
        `);

        await queryRunner.query(`ALTER TABLE "users" ADD "resetToken" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetTokenExpiry" datetime2`);

        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email")`);

        // ========================
        // MEMBER_PROJECT
        // ========================
        await queryRunner.query(`
            ALTER TABLE "member_project" 
            ADD "createdAt" datetime2 NOT NULL DEFAULT getdate()
        `);

        // ========================
        // TASK (ejemplo de cambios)
        // ========================
        await queryRunner.query(`
            ALTER TABLE "task" 
            ADD "priority" varchar(255) 
            CHECK(priority IN ('low','medium','high')) 
            NOT NULL DEFAULT 'medium'
        `);

        // ========================
        // RELACIONES (si faltaban)
        // ========================
        await queryRunner.query(`
            ALTER TABLE "member_project" 
            ADD CONSTRAINT "FK_member_user" 
            FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "member_project" 
            ADD CONSTRAINT "FK_member_project" 
            FOREIGN KEY ("id_project") REFERENCES "projects"("id_proyecto") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`ALTER TABLE "member_project" DROP CONSTRAINT "FK_member_project"`);
        await queryRunner.query(`ALTER TABLE "member_project" DROP CONSTRAINT "FK_member_user"`);

        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "priority"`);

        await queryRunner.query(`ALTER TABLE "member_project" DROP COLUMN "createdAt"`);

        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetTokenExpiry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetToken"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "globalRole"`);

        await queryRunner.query(`ALTER TABLE "users" ADD "role" varchar(50) NOT NULL DEFAULT 'developer'`);
    }
}