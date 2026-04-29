import { MigrationInterface, QueryRunner } from "typeorm";

export class CreacionTablas1776211421775 implements MigrationInterface {
    name = 'CreacionTablas1776211421775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comentarios" ("id_comment" uniqueidentifier NOT NULL CONSTRAINT "DF_57745cd3194862f5a4954afb3a5" DEFAULT NEWSEQUENTIALID(), "comment" text NOT NULL, "id_user" uniqueidentifier NOT NULL, "id_task" uniqueidentifier NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_1154922fc4ef1dd820f20947d4e" DEFAULT getdate(), CONSTRAINT "PK_57745cd3194862f5a4954afb3a5" PRIMARY KEY ("id_comment"))`);
        await queryRunner.query(`CREATE TABLE "tareas" ("id_task" uniqueidentifier NOT NULL CONSTRAINT "DF_bb426bc8d0982a2376c578035ee" DEFAULT NEWSEQUENTIALID(), "title" nvarchar(255) NOT NULL, "description" text, "priority" nvarchar(255) NOT NULL, "status" nvarchar(255) NOT NULL CONSTRAINT "DF_07095faf90014ef0f6c260a1aa9" DEFAULT 'pending', "start_date" datetime2 NOT NULL, "end_date" datetime2, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_c36d248f5585a68f111d79e2c44" DEFAULT getdate(), "id_project" uniqueidentifier NOT NULL, "id_sprint" uniqueidentifier, "createdBy" uniqueidentifier NOT NULL, "assignedTo" uniqueidentifier, CONSTRAINT "PK_bb426bc8d0982a2376c578035ee" PRIMARY KEY ("id_task"))`);
        await queryRunner.query(`CREATE TABLE "sprints" ("id_sprint" uniqueidentifier NOT NULL CONSTRAINT "DF_ca84b73343780bd72b676c83349" DEFAULT NEWSEQUENTIALID(), "name" nvarchar(255) NOT NULL, "start_date" datetime2 NOT NULL, "end_date" datetime2 NOT NULL, "status" nvarchar(255) NOT NULL CONSTRAINT "DF_36abc1836392c93502ff1a16e30" DEFAULT 'planned', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_5c5fbe840b93962bff4a57f263e" DEFAULT getdate(), "id_project" uniqueidentifier NOT NULL, CONSTRAINT "PK_ca84b73343780bd72b676c83349" PRIMARY KEY ("id_sprint"))`);
        await queryRunner.query(`CREATE TABLE "miembro_proyecto" ("id_mp" uniqueidentifier NOT NULL CONSTRAINT "DF_888a3b10b6ffb9e93301d888717" DEFAULT NEWSEQUENTIALID(), "id_user" uniqueidentifier NOT NULL, "id_project" uniqueidentifier NOT NULL, "role" varchar(50) NOT NULL, CONSTRAINT "PK_888a3b10b6ffb9e93301d888717" PRIMARY KEY ("id_mp"))`);
        await queryRunner.query(`CREATE TABLE "projects" ("id_proyecto" uniqueidentifier NOT NULL CONSTRAINT "DF_c40170429377f58a433e4091381" DEFAULT NEWSEQUENTIALID(), "name" nvarchar(255) NOT NULL, "description" text, "start_date" datetime2 NOT NULL, "end_date" datetime2, "status" nvarchar(255) NOT NULL CONSTRAINT "DF_a27865a7be17886e3088f4a6509" DEFAULT 'active', "createdAt" datetime2 NOT NULL CONSTRAINT "DF_4a38e9851744414bbe8142157f4" DEFAULT getdate(), "createdBy" uniqueidentifier NOT NULL, CONSTRAINT "PK_c40170429377f58a433e4091381" PRIMARY KEY ("id_proyecto"))`);
        await queryRunner.query(`ALTER TABLE "comentarios" ADD CONSTRAINT "FK_bc53e2e4b63d945aec474439144" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comentarios" ADD CONSTRAINT "FK_63d15258957615b201991443cb2" FOREIGN KEY ("id_task") REFERENCES "tareas"("id_task") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tareas" ADD CONSTRAINT "FK_684626240acaf684ed609914400" FOREIGN KEY ("id_project") REFERENCES "projects"("id_proyecto") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tareas" ADD CONSTRAINT "FK_486f5c399c21e8dda3d169f58bb" FOREIGN KEY ("id_sprint") REFERENCES "sprints"("id_sprint") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tareas" ADD CONSTRAINT "FK_6bf9c5dbb5cb180a6a7167a57e7" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tareas" ADD CONSTRAINT "FK_3dffb32ef626a4313a31c665f9b" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprints" ADD CONSTRAINT "FK_eb12cf7c3a948769d873cf54459" FOREIGN KEY ("id_project") REFERENCES "projects"("id_proyecto") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "miembro_proyecto" ADD CONSTRAINT "FK_79d1469992d14339cd5f1f9b026" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "miembro_proyecto" ADD CONSTRAINT "FK_3a4b57072d514d9bcf6fff202a6" FOREIGN KEY ("id_project") REFERENCES "projects"("id_proyecto") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_4fcfae511b4f6aaa67a8d325968" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_4fcfae511b4f6aaa67a8d325968"`);
        await queryRunner.query(`ALTER TABLE "miembro_proyecto" DROP CONSTRAINT "FK_3a4b57072d514d9bcf6fff202a6"`);
        await queryRunner.query(`ALTER TABLE "miembro_proyecto" DROP CONSTRAINT "FK_79d1469992d14339cd5f1f9b026"`);
        await queryRunner.query(`ALTER TABLE "sprints" DROP CONSTRAINT "FK_eb12cf7c3a948769d873cf54459"`);
        await queryRunner.query(`ALTER TABLE "tareas" DROP CONSTRAINT "FK_3dffb32ef626a4313a31c665f9b"`);
        await queryRunner.query(`ALTER TABLE "tareas" DROP CONSTRAINT "FK_6bf9c5dbb5cb180a6a7167a57e7"`);
        await queryRunner.query(`ALTER TABLE "tareas" DROP CONSTRAINT "FK_486f5c399c21e8dda3d169f58bb"`);
        await queryRunner.query(`ALTER TABLE "tareas" DROP CONSTRAINT "FK_684626240acaf684ed609914400"`);
        await queryRunner.query(`ALTER TABLE "comentarios" DROP CONSTRAINT "FK_63d15258957615b201991443cb2"`);
        await queryRunner.query(`ALTER TABLE "comentarios" DROP CONSTRAINT "FK_bc53e2e4b63d945aec474439144"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TABLE "miembro_proyecto"`);
        await queryRunner.query(`DROP TABLE "sprints"`);
        await queryRunner.query(`DROP TABLE "tareas"`);
        await queryRunner.query(`DROP TABLE "comentarios"`);
    }

}
