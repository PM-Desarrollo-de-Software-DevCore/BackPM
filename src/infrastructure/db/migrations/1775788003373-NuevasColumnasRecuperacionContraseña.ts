import { MigrationInterface, QueryRunner } from "typeorm";

export class NuevasColumnasRecuperacionContraseña1775788003373 implements MigrationInterface {
    name = 'NuevasColumnasRecuperacionContraseña1775788003373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "resetToken" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetTokenExpiry" datetime2`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetTokenExpiry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetToken"`);
    }

}
