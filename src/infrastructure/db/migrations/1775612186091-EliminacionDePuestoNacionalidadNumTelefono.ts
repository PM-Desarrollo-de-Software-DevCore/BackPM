import { MigrationInterface, QueryRunner } from "typeorm";

export class EliminacionDePuestoNacionalidadNumTelefono1775612186091 implements MigrationInterface {
    name = 'EliminacionDePuestoNacionalidadNumTelefono1775612186091'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "puesto"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nacionalidad"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "numero_telefono"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "numero_telefono" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "nacionalidad" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "puesto" nvarchar(255) NOT NULL`);
    }

}
