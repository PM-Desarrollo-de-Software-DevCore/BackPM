import { MigrationInterface, QueryRunner } from "typeorm";

export class CreacionTablas1776213119027 implements MigrationInterface {
    name = 'CreacionTablas1776213119027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comment" ("id_comment" uniqueidentifier NOT NULL CONSTRAINT "DF_0164c3aed3cf76e0b17b0eaac54" DEFAULT NEWSEQUENTIALID(), "comment" text NOT NULL, "id_user" uniqueidentifier NOT NULL, "id_task" uniqueidentifier NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_3edd3cdb7232a3e9220607eabba" DEFAULT getdate(), CONSTRAINT "PK_0164c3aed3cf76e0b17b0eaac54" PRIMARY KEY ("id_comment"))`);
        await queryRunner.query(`CREATE TABLE "task" ("id_task" uniqueidentifier NOT NULL CONSTRAINT "DF_03217f55c891ad98816877c7a6b" DEFAULT NEWSEQUENTIALID(), "title" nvarchar(255) NOT NULL, "description" text, "priority" nvarchar(255) NOT NULL, "status" nvarchar(255) NOT NULL CONSTRAINT "DF_2fe7a278e6f08d2be55740a939a" DEFAULT 'pending', "start_date" datetime2 NOT NULL, "end_date" datetime2, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_4a54e88f8c42954be40d039f6af" DEFAULT getdate(), "id_project" uniqueidentifier NOT NULL, "id_sprint" uniqueidentifier, "createdBy" uniqueidentifier NOT NULL, "assignedTo" uniqueidentifier, CONSTRAINT "PK_03217f55c891ad98816877c7a6b" PRIMARY KEY ("id_task"))`);
        await queryRunner.query(`CREATE TABLE "sprints" ("id_sprint" uniqueidentifier NOT NULL CONSTRAINT "DF_ca84b73343780bd72b676c83349" DEFAULT NEWSEQUENTIALID(), "name" nvarchar(255) NOT NULL, "start_date" datetime2 NOT NULL, "end_date" datetime2 NOT NULL, "status" nvarchar(255) NOT NULL CONSTRAINT "DF_36abc1836392c93502ff1a16e30" DEFAULT 'planned', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_5c5fbe840b93962bff4a57f263e" DEFAULT getdate(), "id_project" uniqueidentifier NOT NULL, CONSTRAINT "PK_ca84b73343780bd72b676c83349" PRIMARY KEY ("id_sprint"))`);
        await queryRunner.query(`CREATE TABLE "member_project" ("id_mp" uniqueidentifier NOT NULL CONSTRAINT "DF_fc0d73e64590f58274755a8a80b" DEFAULT NEWSEQUENTIALID(), "id_user" uniqueidentifier NOT NULL, "id_project" uniqueidentifier NOT NULL, "role" varchar(50) NOT NULL, CONSTRAINT "PK_fc0d73e64590f58274755a8a80b" PRIMARY KEY ("id_mp"))`);
        await queryRunner.query(`CREATE TABLE "projects" ("id_proyecto" uniqueidentifier NOT NULL CONSTRAINT "DF_c40170429377f58a433e4091381" DEFAULT NEWSEQUENTIALID(), "name" nvarchar(255) NOT NULL, "description" text, "start_date" datetime2 NOT NULL, "end_date" datetime2, "status" nvarchar(255) NOT NULL CONSTRAINT "DF_a27865a7be17886e3088f4a6509" DEFAULT 'active', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_4a38e9851744414bbe8142157f4" DEFAULT getdate(), "createdBy" uniqueidentifier NOT NULL, CONSTRAINT "PK_c40170429377f58a433e4091381" PRIMARY KEY ("id_proyecto"))`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_04eef282a6be5bed4e771c0df51" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_7ed231841f044b0d5a411bc9b19" FOREIGN KEY ("id_task") REFERENCES "task"("id_task") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_c2fd87def85a890c9f93ff92817" FOREIGN KEY ("id_project") REFERENCES "projects"("id_proyecto") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_ea4418e3b3609a3ce1d48c3f640" FOREIGN KEY ("id_sprint") REFERENCES "sprints"("id_sprint") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_0d5ad69a41a534dea0c786e7a6f" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_d6c64183940864565643e9277a9" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprints" ADD CONSTRAINT "FK_eb12cf7c3a948769d873cf54459" FOREIGN KEY ("id_project") REFERENCES "projects"("id_proyecto") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_project" ADD CONSTRAINT "FK_18201f387420d08c84e598c3154" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_project" ADD CONSTRAINT "FK_b702d4f0968941b071b0cc6f1d8" FOREIGN KEY ("id_project") REFERENCES "projects"("id_proyecto") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_4fcfae511b4f6aaa67a8d325968" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_4fcfae511b4f6aaa67a8d325968"`);
        await queryRunner.query(`ALTER TABLE "member_project" DROP CONSTRAINT "FK_b702d4f0968941b071b0cc6f1d8"`);
        await queryRunner.query(`ALTER TABLE "member_project" DROP CONSTRAINT "FK_18201f387420d08c84e598c3154"`);
        await queryRunner.query(`ALTER TABLE "sprints" DROP CONSTRAINT "FK_eb12cf7c3a948769d873cf54459"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_d6c64183940864565643e9277a9"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_0d5ad69a41a534dea0c786e7a6f"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_ea4418e3b3609a3ce1d48c3f640"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_c2fd87def85a890c9f93ff92817"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_7ed231841f044b0d5a411bc9b19"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_04eef282a6be5bed4e771c0df51"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TABLE "member_project"`);
        await queryRunner.query(`DROP TABLE "sprints"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TABLE "comment"`);
    }

}
