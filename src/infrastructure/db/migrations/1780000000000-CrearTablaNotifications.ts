import { MigrationInterface, QueryRunner } from "typeorm"

export class CrearTablaNotifications1780000000000 implements MigrationInterface {
    name = "CrearTablaNotifications1780000000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id_notification" uniqueidentifier NOT NULL CONSTRAINT "DF_notifications_id_notification" DEFAULT NEWID(),
                "recipientUserId" uniqueidentifier NOT NULL,
                "actorUserId" uniqueidentifier NULL,
                "category" varchar(60) NOT NULL,
                "title" varchar(160) NOT NULL,
                "message" varchar(MAX) NOT NULL,
                "relatedType" varchar(40) NULL,
                "relatedId" uniqueidentifier NULL,
                "dedupeKey" varchar(200) NULL,
                "readAt" datetime2 NULL,
                "createdAt" datetime2 NOT NULL CONSTRAINT "DF_notifications_createdAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_notifications" PRIMARY KEY ("id_notification")
            )
        `)

        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_recipient_created"
            ON "notifications" ("recipientUserId", "createdAt" DESC)
        `)

        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_recipient_read"
            ON "notifications" ("recipientUserId", "readAt")
        `)

        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_dedupeKey"
            ON "notifications" ("dedupeKey")
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_notifications_dedupeKey" ON "notifications"`)
        await queryRunner.query(`DROP INDEX "IDX_notifications_recipient_read" ON "notifications"`)
        await queryRunner.query(`DROP INDEX "IDX_notifications_recipient_created" ON "notifications"`)
        await queryRunner.query(`DROP TABLE "notifications"`)
    }
}