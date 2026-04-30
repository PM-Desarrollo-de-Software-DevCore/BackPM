import { MigrationInterface, QueryRunner } from "typeorm";

export class ActualizacionDeCamposEnTablas1776895922163 implements MigrationInterface {
    name = 'ActualizacionDeCamposEnTablas1776895922163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comment" ("id_comment" uniqueidentifier NOT NULL CONSTRAINT "DF_0164c3aed3cf76e0b17b0eaac54" DEFAULT NEWSEQUENTIALID(), "comment" text NOT NULL, "id_user" uniqueidentifier NOT NULL, "id_task" uniqueidentifier NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_3edd3cdb7232a3e9220607eabba" DEFAULT getdate(), CONSTRAINT "PK_0164c3aed3cf76e0b17b0eaac54" PRIMARY KEY ("id_comment"))`);
        await queryRunner.query(`CREATE TABLE "task" ("id_task" uniqueidentifier NOT NULL CONSTRAINT "DF_03217f55c891ad98816877c7a6b" DEFAULT NEWSEQUENTIALID(), "title" nvarchar(255) NOT NULL, "description" text, "status" varchar(255) CONSTRAINT CHK_bbe65754553e025a9e42a829a9_ENUM CHECK(status IN ('pending','in_progress','completed')) NOT NULL CONSTRAINT "DF_2fe7a278e6f08d2be55740a939a" DEFAULT 'pending', "priority" varchar(255) CONSTRAINT CHK_13887ad6538521dc21bbcf29d8_ENUM CHECK(priority IN ('low','medium','high')) NOT NULL CONSTRAINT "DF_f092f3386f10f2e2ef5b0b6ad1c" DEFAULT 'medium', "start_date" datetime2 NOT NULL, "end_date" datetime2, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_4a54e88f8c42954be40d039f6af" DEFAULT getdate(), "id_project" uniqueidentifier NOT NULL, "id_sprint" uniqueidentifier, "createdBy" uniqueidentifier NOT NULL, "assignedTo" uniqueidentifier, CONSTRAINT "PK_03217f55c891ad98816877c7a6b" PRIMARY KEY ("id_task"))`);
        await queryRunner.query(`CREATE TABLE "sprints" ("id_sprint" uniqueidentifier NOT NULL CONSTRAINT "DF_ca84b73343780bd72b676c83349" DEFAULT NEWSEQUENTIALID(), "name" nvarchar(255) NOT NULL, "start_date" datetime2 NOT NULL, "end_date" datetime2 NOT NULL, "status" varchar(255) NOT NULL CONSTRAINT "DF_36abc1836392c93502ff1a16e30" DEFAULT 'planned', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_5c5fbe840b93962bff4a57f263e" DEFAULT getdate(), "id_project" uniqueidentifier NOT NULL, CONSTRAINT "PK_ca84b73343780bd72b676c83349" PRIMARY KEY ("id_sprint"))`);
        await queryRunner.query(`CREATE TABLE "member_project" ("id_mp" uniqueidentifier NOT NULL CONSTRAINT "DF_fc0d73e64590f58274755a8a80b" DEFAULT NEWSEQUENTIALID(), "id_user" uniqueidentifier NOT NULL, "id_project" uniqueidentifier NOT NULL, "role" varchar(50) NOT NULL CONSTRAINT "DF_a1d84779c19debf4045f1afacec" DEFAULT 'developer', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_8f7f2d686c52b0c31eeb1cae077" DEFAULT getdate(), CONSTRAINT "PK_fc0d73e64590f58274755a8a80b" PRIMARY KEY ("id_mp"))`);
        await queryRunner.query(`CREATE TABLE "projects" ("id_project" uniqueidentifier NOT NULL CONSTRAINT "DF_bb37a1e2bd233e3576ae930fd0b" DEFAULT NEWSEQUENTIALID(), "name" nvarchar(255) NOT NULL, "description" text, "start_date" datetime2 NOT NULL, "end_date" datetime2, "status" varchar(255) CONSTRAINT CHK_497d1cb88723cdab4fc3ea7d5d_ENUM CHECK(status IN ('active','finished','paused')) NOT NULL CONSTRAINT "DF_a27865a7be17886e3088f4a6509" DEFAULT 'active', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_4a38e9851744414bbe8142157f4" DEFAULT getdate(), "createdBy" uniqueidentifier NOT NULL, CONSTRAINT "PK_bb37a1e2bd233e3576ae930fd0b" PRIMARY KEY ("id_project"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "globalRole" varchar(255) CONSTRAINT CHK_274883fdab04e85943b17353f7_ENUM CHECK(globalRole IN ('admin','user')) NOT NULL CONSTRAINT "DF_d76d9f6562dbf87909ddbdc91da" DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetToken" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetTokenExpiry" datetime2`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_04eef282a6be5bed4e771c0df51" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_7ed231841f044b0d5a411bc9b19" FOREIGN KEY ("id_task") REFERENCES "task"("id_task") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_c2fd87def85a890c9f93ff92817" FOREIGN KEY ("id_project") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_ea4418e3b3609a3ce1d48c3f640" FOREIGN KEY ("id_sprint") REFERENCES "sprints"("id_sprint") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_0d5ad69a41a534dea0c786e7a6f" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_d6c64183940864565643e9277a9" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprints" ADD CONSTRAINT "FK_eb12cf7c3a948769d873cf54459" FOREIGN KEY ("id_project") REFERENCES "projects"("id_project") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_project" ADD CONSTRAINT "FK_18201f387420d08c84e598c3154" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_project" ADD CONSTRAINT "FK_b702d4f0968941b071b0cc6f1d8" FOREIGN KEY ("id_project") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetTokenExpiry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetToken"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_d76d9f6562dbf87909ddbdc91da"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "globalRole"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'developer' FOR "role"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TABLE "member_project"`);
        await queryRunner.query(`DROP TABLE "sprints"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`DROP TABLE "comment"`);
    }

}
