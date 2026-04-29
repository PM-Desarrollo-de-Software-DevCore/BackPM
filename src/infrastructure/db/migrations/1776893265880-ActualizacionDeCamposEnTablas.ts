import { MigrationInterface, QueryRunner } from "typeorm";

export class ActualizacionDeCamposEnTablas1776893265880 implements MigrationInterface {
    name = 'ActualizacionDeCamposEnTablas1776893265880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // PRIMERO: Eliminar TODAS las foreign keys que hacen referencia a projects
        await queryRunner.query(`ALTER TABLE "member_project" DROP CONSTRAINT "FK_b702d4f0968941b071b0cc6f1d8"`);
        await queryRunner.query(`ALTER TABLE "sprints" DROP CONSTRAINT "FK_eb12cf7c3a948769d873cf54459"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_c2fd87def85a890c9f93ff92817"`);

        // SEGUNDO: Ahora sí, eliminar la primary key de projects
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "PK_c40170429377f58a433e4091381"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "id_proyecto"`);
        
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "member_project" ADD "createdAt" datetime2 NOT NULL CONSTRAINT "DF_8f7f2d686c52b0c31eeb1cae077" DEFAULT getdate()`);
        
        // Crear nueva primary key en projects
        await queryRunner.query(`ALTER TABLE "projects" ADD "id_project" uniqueidentifier NOT NULL CONSTRAINT "DF_bb37a1e2bd233e3576ae930fd0b" DEFAULT NEWSEQUENTIALID()`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "PK_bb37a1e2bd233e3576ae930fd0b" PRIMARY KEY ("id_project")`);
        
        await queryRunner.query(`ALTER TABLE "users" ADD "globalRole" varchar(255) CONSTRAINT CHK_274883fdab04e85943b17353f7_ENUM CHECK(globalRole IN ('admin','user')) NOT NULL CONSTRAINT "DF_d76d9f6562dbf87909ddbdc91da" DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "DF_2fe7a278e6f08d2be55740a939a"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "status" varchar(255) CONSTRAINT CHK_bbe65754553e025a9e42a829a9_ENUM CHECK(status IN ('pending','in_progress','completed')) NOT NULL CONSTRAINT "DF_2fe7a278e6f08d2be55740a939a" DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "priority"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "priority" varchar(255) CONSTRAINT CHK_13887ad6538521dc21bbcf29d8_ENUM CHECK(priority IN ('low','medium','high')) NOT NULL CONSTRAINT "DF_f092f3386f10f2e2ef5b0b6ad1c" DEFAULT 'medium'`);
        await queryRunner.query(`ALTER TABLE "sprints" DROP CONSTRAINT "DF_36abc1836392c93502ff1a16e30"`);
        await queryRunner.query(`ALTER TABLE "sprints" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "sprints" ADD "status" varchar(255) NOT NULL CONSTRAINT "DF_36abc1836392c93502ff1a16e30" DEFAULT 'planned'`);
        await queryRunner.query(`ALTER TABLE "member_project" ADD CONSTRAINT "DF_a1d84779c19debf4045f1afacec" DEFAULT 'developer' FOR "role"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "DF_a27865a7be17886e3088f4a6509"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "status" varchar(255) CONSTRAINT CHK_497d1cb88723cdab4fc3ea7d5d_ENUM CHECK(status IN ('active','finished','paused')) NOT NULL CONSTRAINT "DF_a27865a7be17886e3088f4a6509" DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);

        // TERCERO: Recrear TODAS las foreign keys hacia la nueva primary key
        await queryRunner.query(`ALTER TABLE "member_project" ADD CONSTRAINT "FK_b702d4f0968941b071b0cc6f1d8" FOREIGN KEY ("id_project") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprints" ADD CONSTRAINT "FK_eb12cf7c3a948769d873cf54459" FOREIGN KEY ("id_project") REFERENCES "projects"("id_project") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_c2fd87def85a890c9f93ff92817" FOREIGN KEY ("id_project") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // PRIMERO: Eliminar foreign keys
        await queryRunner.query(`ALTER TABLE "member_project" DROP CONSTRAINT "FK_b702d4f0968941b071b0cc6f1d8"`);
        await queryRunner.query(`ALTER TABLE "sprints" DROP CONSTRAINT "FK_eb12cf7c3a948769d873cf54459"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_c2fd87def85a890c9f93ff92817"`);

        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "DF_a27865a7be17886e3088f4a6509"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "status" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "DF_a27865a7be17886e3088f4a6509" DEFAULT 'active' FOR "status"`);
        await queryRunner.query(`ALTER TABLE "member_project" DROP CONSTRAINT "DF_a1d84779c19debf4045f1afacec"`);
        await queryRunner.query(`ALTER TABLE "sprints" DROP CONSTRAINT "DF_36abc1836392c93502ff1a16e30"`);
        await queryRunner.query(`ALTER TABLE "sprints" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "sprints" ADD "status" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprints" ADD CONSTRAINT "DF_36abc1836392c93502ff1a16e30" DEFAULT 'planned' FOR "status"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "DF_f092f3386f10f2e2ef5b0b6ad1c"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "priority"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "priority" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "DF_2fe7a278e6f08d2be55740a939a"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "status" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "DF_2fe7a278e6f08d2be55740a939a" DEFAULT 'pending' FOR "status"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_d76d9f6562dbf87909ddbdc91da"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "globalRole"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "PK_bb37a1e2bd233e3576ae930fd0b"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "id_project"`);
        await queryRunner.query(`ALTER TABLE "member_project" DROP CONSTRAINT "DF_8f7f2d686c52b0c31eeb1cae077"`);
        await queryRunner.query(`ALTER TABLE "member_project" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'developer' FOR "role"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "id_proyecto" uniqueidentifier NOT NULL CONSTRAINT "DF_c40170429377f58a433e4091381" DEFAULT NEWSEQUENTIALID()`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "PK_c40170429377f58a433e4091381" PRIMARY KEY ("id_proyecto")`);

        // ÚLTIMO: Recrear foreign keys con la antigua primary key
        await queryRunner.query(`ALTER TABLE "member_project" ADD CONSTRAINT "FK_b702d4f0968941b071b0cc6f1d8" FOREIGN KEY ("id_project") REFERENCES "projects"("id_proyecto") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprints" ADD CONSTRAINT "FK_eb12cf7c3a948769d873cf54459" FOREIGN KEY ("id_project") REFERENCES "projects"("id_proyecto") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_c2fd87def85a890c9f93ff92817" FOREIGN KEY ("id_project") REFERENCES "projects"("id_proyecto") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}