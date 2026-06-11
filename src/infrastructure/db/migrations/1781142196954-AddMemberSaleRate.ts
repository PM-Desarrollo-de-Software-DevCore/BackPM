import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMemberSaleRate1781142196954 implements MigrationInterface {
    name = 'AddMemberSaleRate1781142196954'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // NOTA: migration:generate aluciná, ademas de este cambio, DROPs de constraints
        // no relacionadas (CHK/DF de task y el DEFAULT newid() del PK de notifications) por
        // drift entidad<->BD. Se ELIMINARON: dropearlas romperia inserts/constraints en prod.
        // Esta migracion solo agrega la columna sale_rate. Ver memoria project_typeorm_hash_names.
        await queryRunner.query(`ALTER TABLE "member_project" ADD "sale_rate" float`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member_project" DROP COLUMN "sale_rate"`);
    }

}
