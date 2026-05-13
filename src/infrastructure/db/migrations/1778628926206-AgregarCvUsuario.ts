import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarCvUsuario1778628926206 implements MigrationInterface {
    name = 'AgregarCvUsuario1778628926206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "cvUrl" varchar(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cvUrl"`);
    }

}
