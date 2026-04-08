import { MigrationInterface, QueryRunner } from "typeorm";

export class CambioTipoEnColumnaRole1775615315410 implements MigrationInterface {
    name = 'CambioTipoEnColumnaRole1775615315410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" varchar(50) NOT NULL CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'developer'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'developer' FOR "role"`);
    }

}
