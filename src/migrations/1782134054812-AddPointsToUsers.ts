import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPointsToUsers1782134054812 implements MigrationInterface {
    name = 'AddPointsToUsers1782134054812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "points" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "points"`);
    }

}
