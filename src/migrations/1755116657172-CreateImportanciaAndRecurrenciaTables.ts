import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateImportanciaAndRecurrenciaTables1755116657172 implements MigrationInterface {
  name = 'CreateImportanciaAndRecurrenciaTables1755116657172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla importancia
    await queryRunner.query(`
      CREATE TABLE "importancia" (
        "id" INTEGER PRIMARY KEY,
        "nombre" VARCHAR(50) NOT NULL
      )
    `);

    // Crear tabla recurrencia
    await queryRunner.query(`
      CREATE TABLE "recurrencia" (
        "id" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(50) NOT NULL
      )
    `);

    // Insertar valores de importancia
    await queryRunner.query(`
      INSERT INTO "importancia" (id, nombre) VALUES
      (1, 'Muy Baja'),
      (2, 'Baja'),
      (3, 'Media'),
      (4, 'Alta'),
      (5, 'Muy Alta')
    `);

    // Insertar valores de recurrencia
    await queryRunner.query(`
      INSERT INTO "recurrencia" (nombre) VALUES
      ('Sin Recurrencia'),
      ('Diario'),
      ('Semanal'),
      ('Mensual'),
      ('Anual'),
      ('Lunes'),
      ('Martes'),
      ('Miércoles'),
      ('Jueves'),
      ('Viernes'),
      ('Sábado'),
      ('Domingo')
    `);

    // Agregar columnas de referencia en eventos
    await queryRunner.query(`
      ALTER TABLE "eventos" 
      ADD COLUMN "importancia_id" INTEGER REFERENCES "importancia"(id) DEFAULT 1
    `);

    await queryRunner.query(`
      ALTER TABLE "eventos" 
      ADD COLUMN "recurrencia_id" INTEGER REFERENCES "recurrencia"(id) DEFAULT 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover columnas de referencia
    await queryRunner.query(`
      ALTER TABLE "eventos" DROP COLUMN "recurrencia_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "eventos" DROP COLUMN "importancia_id"
    `);

    // Remover tablas
    await queryRunner.query(`DROP TABLE "recurrencia"`);
    await queryRunner.query(`DROP TABLE "importancia"`);
  }
}
