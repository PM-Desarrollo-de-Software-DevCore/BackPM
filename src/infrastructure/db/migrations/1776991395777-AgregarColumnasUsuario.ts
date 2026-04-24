import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarColumnasUsuario1776991395777 implements MigrationInterface {
    name = 'AgregarColumnasUsuario1776991395777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "skill" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "area" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneNumber" varchar(20)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "area"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "skill"`);
    }

}
