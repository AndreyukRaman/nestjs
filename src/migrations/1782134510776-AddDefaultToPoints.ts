import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultToPoints1782134510776 implements MigrationInterface {
    name = 'AddDefaultToPoints1782134510776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "points" SET DEFAULT '10'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "points" DROP DEFAULT`);
    }

}
