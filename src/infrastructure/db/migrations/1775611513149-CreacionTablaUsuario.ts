import { MigrationInterface, QueryRunner } from "typeorm";

export class CreacionTablaUsuario1775611513149 implements MigrationInterface {
    name = 'CreacionTablaUsuario1775611513149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_a3ffb1c0c8416b9fc6f907b7433" DEFAULT NEWSEQUENTIALID(), "email" nvarchar(255) NOT NULL, "password" nvarchar(255) NOT NULL, "nombre" nvarchar(255) NOT NULL, "apellido" nvarchar(255) NOT NULL, "rol" nvarchar(255) NOT NULL CONSTRAINT "DF_e57b2359564cb64f4a8e2dbfd7f" DEFAULT 'developer', "puesto" nvarchar(255) NOT NULL, "nacionalidad" nvarchar(255) NOT NULL, "numero_telefono" nvarchar(255) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_204e9b624861ff4a5b268192101" DEFAULT getdate(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
