import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearTablaHitos1779911668733 implements MigrationInterface {
    name = 'CrearTablaHitos1779911668733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "milestones" ("id_milestone" uniqueidentifier NOT NULL CONSTRAINT "DF_e5ce84f8cbbeb116730e64a0b5b" DEFAULT NEWSEQUENTIALID(), "title" nvarchar(255) NOT NULL, "description" varchar(MAX), "due_date" datetime2 NOT NULL, "completedAt" datetime2, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_e40b96ed2e2af8c7a02c72f59ae" DEFAULT getdate(), "id_project" uniqueidentifier NOT NULL, "createdBy" uniqueidentifier NOT NULL, CONSTRAINT "PK_e5ce84f8cbbeb116730e64a0b5b" PRIMARY KEY ("id_milestone"))`);
        await queryRunner.query(`ALTER TABLE "milestones" ADD CONSTRAINT "FK_e2620b8f7a78bc17bc601819166" FOREIGN KEY ("id_project") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "milestones" ADD CONSTRAINT "FK_edba251665fa62f5ce6b5dda75a" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "milestones" DROP CONSTRAINT "FK_edba251665fa62f5ce6b5dda75a"`);
        await queryRunner.query(`ALTER TABLE "milestones" DROP CONSTRAINT "FK_e2620b8f7a78bc17bc601819166"`);
        await queryRunner.query(`DROP TABLE "milestones"`);
    }

}
