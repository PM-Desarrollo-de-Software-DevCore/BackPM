import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMemberFteAndRate1780327564892 implements MigrationInterface {
    name = 'AddMemberFteAndRate1780327564892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member_project" ADD "fte" float`);
        await queryRunner.query(`ALTER TABLE "member_project" ADD "monthly_rate" float`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member_project" DROP COLUMN "monthly_rate"`);
        await queryRunner.query(`ALTER TABLE "member_project" DROP COLUMN "fte"`);
    }

}
