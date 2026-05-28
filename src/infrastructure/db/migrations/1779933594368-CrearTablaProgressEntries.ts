import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearTablaProgressEntries1779933594368 implements MigrationInterface {
    name = 'CrearTablaProgressEntries1779933594368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "progress_entries" ("id_entry" uniqueidentifier NOT NULL CONSTRAINT "DF_8c0d0a9c2696783affb011df462" DEFAULT NEWSEQUENTIALID(), "type" varchar(255) CONSTRAINT CHK_65e957d84158e563db25f577f5_ENUM CHECK(type IN ('progress','blocker')) NOT NULL, "description" varchar(MAX) NOT NULL, "date" datetime2 NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_0c14affcd41ef1b5e03933eb890" DEFAULT getdate(), "id_project" uniqueidentifier NOT NULL, "id_sprint" uniqueidentifier, "createdBy" uniqueidentifier NOT NULL, CONSTRAINT "PK_8c0d0a9c2696783affb011df462" PRIMARY KEY ("id_entry"))`);
        await queryRunner.query(`ALTER TABLE "progress_entries" ADD CONSTRAINT "FK_50aa45e03e4a5e22a3ad44e1df5" FOREIGN KEY ("id_project") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress_entries" ADD CONSTRAINT "FK_d5e16caabf0b1fa53689e84189c" FOREIGN KEY ("id_sprint") REFERENCES "sprints"("id_sprint") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress_entries" ADD CONSTRAINT "FK_d3505123f721a75ac2525d09fe7" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "progress_entries" DROP CONSTRAINT "FK_d3505123f721a75ac2525d09fe7"`);
        await queryRunner.query(`ALTER TABLE "progress_entries" DROP CONSTRAINT "FK_d5e16caabf0b1fa53689e84189c"`);
        await queryRunner.query(`ALTER TABLE "progress_entries" DROP CONSTRAINT "FK_50aa45e03e4a5e22a3ad44e1df5"`);
        await queryRunner.query(`DROP TABLE "progress_entries"`);
    }

}
