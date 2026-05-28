import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearTablaProfileChangeRequests1779941479287 implements MigrationInterface {
    name = 'CrearTablaProfileChangeRequests1779941479287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profile_change_requests" ("id_request" uniqueidentifier NOT NULL CONSTRAINT "DF_96f255f5cff0383c63635f329b5" DEFAULT NEWSEQUENTIALID(), "id_user" uniqueidentifier NOT NULL, "proposedChanges" varchar(MAX) NOT NULL, "status" varchar(20) CONSTRAINT CHK_8189e3e9f1c68894d820efb49b_ENUM CHECK(status IN ('pending','approved','rejected','cancelled')) NOT NULL CONSTRAINT "DF_e7ac5c49d145b49b3ea6943d28a" DEFAULT 'pending', "reviewedBy" uniqueidentifier, "reviewNote" varchar(MAX), "createdAt" datetime2 NOT NULL CONSTRAINT "DF_ab9b0428dba683969c569b3b856" DEFAULT getdate(), "reviewedAt" datetime2, CONSTRAINT "PK_96f255f5cff0383c63635f329b5" PRIMARY KEY ("id_request"))`);
        await queryRunner.query(`ALTER TABLE "profile_change_requests" ADD CONSTRAINT "FK_33ff2fe8440eb1edbfe87e54872" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profile_change_requests" ADD CONSTRAINT "FK_0313152b150efb440d1ad33eeef" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profile_change_requests" DROP CONSTRAINT "FK_0313152b150efb440d1ad33eeef"`);
        await queryRunner.query(`ALTER TABLE "profile_change_requests" DROP CONSTRAINT "FK_33ff2fe8440eb1edbfe87e54872"`);
        await queryRunner.query(`DROP TABLE "profile_change_requests"`);
    }

}
