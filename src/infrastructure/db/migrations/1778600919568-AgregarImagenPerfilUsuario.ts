import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarImagenPerfilUsuario1778600919568 implements MigrationInterface {
    name = 'AgregarImagenPerfilUsuario1778600919568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "profileImageUrl" varchar(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileImageUrl"`);
    }

}
