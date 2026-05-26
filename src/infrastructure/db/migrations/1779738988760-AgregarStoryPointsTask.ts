import { MigrationInterface, QueryRunner } from "typeorm";

export class AgregarStoryPointsTask1779738988760 implements MigrationInterface {
    name = 'AgregarStoryPointsTask1779738988760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // story_points: int nullable (NULL = tarea sin estimar) + CHECK de no-negatividad.
        // Nota: migration:generate tambien sugirio dropear el DEFAULT de "task_number"
        // (drift preexistente entre la entidad y la BD); se omite a proposito por estar
        // fuera del alcance de esta migracion.
        await queryRunner.query(`ALTER TABLE "task" ADD "story_points" int`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "CHK_task_story_points_nonneg" CHECK ("story_points" >= 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "CHK_task_story_points_nonneg"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "story_points"`);
    }

}
