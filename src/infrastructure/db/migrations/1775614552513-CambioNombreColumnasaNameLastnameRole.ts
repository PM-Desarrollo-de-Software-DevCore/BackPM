import { MigrationInterface, QueryRunner } from "typeorm";

export class CambioNombreColumnasaNameLastnameRole1775614552513 implements MigrationInterface {
    name = 'CambioNombreColumnasaNameLastnameRole1775614552513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nombre"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "apellido"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_e57b2359564cb64f4a8e2dbfd7f"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "rol"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "name" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastname" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" nvarchar(255) NOT NULL CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'developer'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastname"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "rol" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "DF_e57b2359564cb64f4a8e2dbfd7f" DEFAULT 'developer' FOR "rol"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "apellido" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "nombre" nvarchar(255) NOT NULL`);
    }

}
