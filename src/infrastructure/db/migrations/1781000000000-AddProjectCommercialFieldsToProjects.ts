import { MigrationInterface, QueryRunner } from "typeorm"

export class AddProjectCommercialFieldsToProjects1781000000000 implements MigrationInterface {
    name = "AddProjectCommercialFieldsToProjects1781000000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD "client" nvarchar(255)`)
        await queryRunner.query(`ALTER TABLE "projects" ADD "project_type" nvarchar(255)`)
        await queryRunner.query(`ALTER TABLE "projects" ADD "methodology" varchar(20)`)
        await queryRunner.query(`ALTER TABLE "projects" ADD "estimated_sprints" int`)
        await queryRunner.query(`ALTER TABLE "projects" ADD "budget" float`)
        await queryRunner.query(`ALTER TABLE "projects" ADD "monthly_cost" float`)
        await queryRunner.query(`ALTER TABLE "projects" ADD "billing_model" varchar(30)`)

        await queryRunner.query(`
            UPDATE "projects"
            SET
                "client" = COALESCE(NULLIF("client", ''), "name"),
                "project_type" = COALESCE(NULLIF("project_type", ''), 'legacy'),
                "methodology" = COALESCE("methodology", 'scrum')
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            ALTER COLUMN "client" nvarchar(255) NOT NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            ALTER COLUMN "project_type" nvarchar(255) NOT NULL
        `)

        await queryRunner.query(`
            ALTER TABLE "projects"
            ALTER COLUMN "methodology" varchar(20) NOT NULL
        `)

        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "CHK_projects_methodology" CHECK ("methodology" IN ('scrum', 'kanban'))`)
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "CHK_projects_billing_model" CHECK ("billing_model" IN ('fixed_price', 'time_and_materials', 'retainer') OR "billing_model" IS NULL)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "CHK_projects_billing_model"`)
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "CHK_projects_methodology"`)

        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "billing_model"`)
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "monthly_cost"`)
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "budget"`)
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "estimated_sprints"`)
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "methodology"`)
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "project_type"`)
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "client"`)
    }
}