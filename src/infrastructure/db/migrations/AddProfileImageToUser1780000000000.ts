import { MigrationInterface, QueryRunner } from "typeorm"

export class AddProfileImageToUser1780000000000 implements MigrationInterface {
    name = "AddProfileImageToUser1780000000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "profileImageUrl" varchar(500) NULL
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "profileImageUrl"
        `)
    }
}
