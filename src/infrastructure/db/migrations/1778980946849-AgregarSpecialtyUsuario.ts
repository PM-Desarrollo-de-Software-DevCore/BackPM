import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarSpecialtyUsuario1778980946849 implements MigrationInterface {
    name = 'AgregarSpecialtyUsuario1778980946849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "specialty" varchar(255) CONSTRAINT CHK_10ebe86b819f4227ba77fc230c_ENUM CHECK(specialty IN ('frontend','backend','database','fullstack','devops','mobile','qa'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "specialty"`);
    }

}
