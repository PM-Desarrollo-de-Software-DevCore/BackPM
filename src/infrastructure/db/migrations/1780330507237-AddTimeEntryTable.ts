import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimeEntryTable1780330507237 implements MigrationInterface {
    name = 'AddTimeEntryTable1780330507237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "time_entry" ("id_time_entry" uniqueidentifier NOT NULL CONSTRAINT "DF_16f03fe4efa3d02f050ba9a2f26" DEFAULT NEWSEQUENTIALID(), "id_task" uniqueidentifier NOT NULL, "id_user" uniqueidentifier NOT NULL, "id_project" uniqueidentifier NOT NULL, "hours" float NOT NULL, "work_date" datetime2 NOT NULL, "description" varchar(MAX), "createdAt" datetime2 NOT NULL CONSTRAINT "DF_a62ab39e41b159ff09e8e692332" DEFAULT getdate(), CONSTRAINT "PK_16f03fe4efa3d02f050ba9a2f26" PRIMARY KEY ("id_time_entry"))`);
        await queryRunner.query(`ALTER TABLE "time_entry" ADD CONSTRAINT "FK_38836b4ea092773d4996969788b" FOREIGN KEY ("id_task") REFERENCES "task"("id_task") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "time_entry" ADD CONSTRAINT "FK_af5779a4adeb3f30c6e1628b77c" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "time_entry" DROP CONSTRAINT "FK_af5779a4adeb3f30c6e1628b77c"`);
        await queryRunner.query(`ALTER TABLE "time_entry" DROP CONSTRAINT "FK_38836b4ea092773d4996969788b"`);
        await queryRunner.query(`DROP TABLE "time_entry"`);
    }

}
