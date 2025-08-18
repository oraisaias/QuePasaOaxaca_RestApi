import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsRecurrentFieldToEventos1755116657169 implements MigrationInterface {
  name = 'AddIsRecurrentFieldToEventos1755116657169';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "eventos" ADD "is_recurrent" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "eventos" DROP COLUMN "is_recurrent"`);
  }
}
