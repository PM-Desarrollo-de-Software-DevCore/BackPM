import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvoiceTable1780333544212 implements MigrationInterface {
    name = 'AddInvoiceTable1780333544212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invoice" ("id_invoice" uniqueidentifier NOT NULL CONSTRAINT "DF_2bd284e3708be20e170e2464607" DEFAULT NEWSEQUENTIALID(), "id_project" uniqueidentifier NOT NULL, "amount" float NOT NULL, "status" varchar(20) NOT NULL CONSTRAINT "DF_b14e893339e619f51db7d6692fa" DEFAULT 'draft', "concept" varchar(MAX), "issue_date" datetime2 NOT NULL, "due_date" datetime2, "period_start" datetime2, "period_end" datetime2, "id_milestone" uniqueidentifier, "createdBy" uniqueidentifier NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_31aef0453df6db5015712eb2d29" DEFAULT getdate(), CONSTRAINT "PK_2bd284e3708be20e170e2464607" PRIMARY KEY ("id_invoice"))`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_b07e1a831383f712032f6b1cdba" FOREIGN KEY ("id_project") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_b07e1a831383f712032f6b1cdba"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
    }

}
