import { MigrationInterface, QueryRunner } from "typeorm"

export class AddProjectObjectiveToProjects1782000000000 implements MigrationInterface {
    name = "AddProjectObjectiveToProjects1782000000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD "project_objective" nvarchar(MAX)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "project_objective"`)
    }
}