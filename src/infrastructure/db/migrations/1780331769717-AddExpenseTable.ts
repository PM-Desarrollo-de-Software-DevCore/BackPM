import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpenseTable1780331769717 implements MigrationInterface {
    name = 'AddExpenseTable1780331769717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "expense" ("id_expense" uniqueidentifier NOT NULL CONSTRAINT "DF_95dc37683c40287173770b5dde7" DEFAULT NEWSEQUENTIALID(), "id_project" uniqueidentifier NOT NULL, "amount" float NOT NULL, "category" varchar(30) NOT NULL, "description" varchar(MAX), "date" datetime2 NOT NULL, "createdBy" uniqueidentifier NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_7c85b235e3c94b991a06a048300" DEFAULT getdate(), CONSTRAINT "PK_95dc37683c40287173770b5dde7" PRIMARY KEY ("id_expense"))`);
        await queryRunner.query(`ALTER TABLE "expense" ADD CONSTRAINT "FK_2d47f0375f6cffec376cb25fd8e" FOREIGN KEY ("id_project") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expense" DROP CONSTRAINT "FK_2d47f0375f6cffec376cb25fd8e"`);
        await queryRunner.query(`DROP TABLE "expense"`);
    }

}
