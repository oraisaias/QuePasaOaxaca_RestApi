import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGeomFieldToEventos1755116657168 implements MigrationInterface {
  name = 'AddGeomFieldToEventos1755116657168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar la extensión PostGIS si no existe
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    
    // Agregar la columna geom
    await queryRunner.query(
      `ALTER TABLE "eventos" ADD "geom" geometry(Point,4326)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "eventos" DROP COLUMN "geom"`);
  }
}
