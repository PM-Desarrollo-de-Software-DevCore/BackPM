import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearTablaUserTechnologies1778979340001 implements MigrationInterface {
    name = 'CrearTablaUserTechnologies1778979340001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_technologies" ("id_user_tech" uniqueidentifier NOT NULL CONSTRAINT "DF_e8499945b358a926d20fe0a61a8" DEFAULT NEWSEQUENTIALID(), "id_user" uniqueidentifier NOT NULL, "technology" nvarchar(100) NOT NULL, "yearsOfExperience" int NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_99e2776476b1097d44e008173d6" DEFAULT getdate(), CONSTRAINT "UQ_user_technology" UNIQUE ("id_user", "technology"), CONSTRAINT "PK_e8499945b358a926d20fe0a61a8" PRIMARY KEY ("id_user_tech"))`);
        await queryRunner.query(`ALTER TABLE "user_technologies" ADD CONSTRAINT "FK_2115226ef68cd818aeed12d424c" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_technologies" DROP CONSTRAINT "FK_2115226ef68cd818aeed12d424c"`);
        await queryRunner.query(`DROP TABLE "user_technologies"`);
    }

}
