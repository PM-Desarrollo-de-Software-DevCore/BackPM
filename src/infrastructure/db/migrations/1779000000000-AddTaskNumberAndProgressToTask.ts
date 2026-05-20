import { MigrationInterface, QueryRunner } from "typeorm"

export class AddTaskNumberAndProgressToTask1779000000000 implements MigrationInterface {
    name = "AddTaskNumberAndProgressToTask1779000000000"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "task"
            ADD "task_number" int NOT NULL DEFAULT 0
        `)

        await queryRunner.query(`
            ALTER TABLE "task"
            ADD "progress" int NOT NULL DEFAULT 0
        `)

        await queryRunner.query(`
            ALTER TABLE "task"
            ADD CONSTRAINT "CHK_task_progress_range"
            CHECK ("progress" >= 0 AND "progress" <= 100)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar y eliminar constraint de progreso
        try {
            await queryRunner.query(`
                ALTER TABLE "task"
                DROP CONSTRAINT "CHK_task_progress_range"
            `)
        } catch (e) {}

        try {
            await queryRunner.query(`
                ALTER TABLE "task"
                DROP CONSTRAINT "DF_task_progress"
            `)
        } catch (e) {}

        try {
            await queryRunner.query(`
                ALTER TABLE "task"
                DROP COLUMN "progress"
            `)
        } catch (e) {}

        try {
            await queryRunner.query(`
                ALTER TABLE "task"
                DROP CONSTRAINT "DF_task_task_number"
            `)
        } catch (e) {}

        try {
            await queryRunner.query(`
                ALTER TABLE "task"
                DROP COLUMN "task_number"
            `)
        } catch (e) {}
    }
}
