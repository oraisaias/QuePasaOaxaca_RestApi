import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesAndBannedUsers1755116657170 implements MigrationInterface {
  name = 'CreateRolesAndBannedUsers1755116657170';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum para roles
    await queryRunner.query(`
      CREATE TYPE "public"."role_name_enum" AS ENUM('admin', 'app_user')
    `);

    // Crear tabla roles
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" "public"."role_name_enum" NOT NULL,
        "description" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"),
        CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
      )
    `);

    // Insertar roles por defecto
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description") VALUES 
      ('admin', 'Administrador del sistema'),
      ('app_user', 'Usuario de la aplicación móvil')
    `);

    // Crear tabla banned_users
    await queryRunner.query(`
      CREATE TABLE "banned_users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "reason" character varying NOT NULL,
        "banned_by" character varying,
        "banned_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_1234567890abcdef" PRIMARY KEY ("id")
      )
    `);

    // Agregar foreign key para banned_users
    await queryRunner.query(`
      ALTER TABLE "banned_users" 
      ADD CONSTRAINT "FK_banned_users_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Agregar columna role_id a users
    await queryRunner.query(`
      ALTER TABLE "users" ADD "role_id" uuid NOT NULL
    `);

    // Agregar columna device_id a users
    await queryRunner.query(`
      ALTER TABLE "users" ADD "device_id" character varying
    `);

    // Hacer email y password_hash nullable
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL
    `);

    // Agregar unique constraint para device_id
    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "UQ_users_device_id" UNIQUE ("device_id")
    `);

    // Agregar foreign key para role_id
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_users_role_id" 
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    // Asignar rol admin a usuarios existentes
    const adminRoleId = await queryRunner.query(`
      SELECT id FROM "roles" WHERE name = 'admin' LIMIT 1
    `);

    if (adminRoleId.length > 0) {
      await queryRunner.query(`
        UPDATE "users" SET "role_id" = '${adminRoleId[0].id}'
      `);
    }

    // Eliminar la columna role anterior
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "role"
    `);

    // Eliminar el enum anterior si existe
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."user_role"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recrear el enum anterior
    await queryRunner.query(`
      CREATE TYPE "public"."user_role" AS ENUM('admin', 'user')
    `);

    // Agregar columna role anterior
    await queryRunner.query(`
      ALTER TABLE "users" ADD "role" "public"."user_role" NOT NULL DEFAULT 'admin'
    `);

    // Eliminar foreign keys
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT "FK_users_role_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "banned_users" DROP CONSTRAINT "FK_banned_users_user_id"
    `);

    // Eliminar columnas nuevas
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "role_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "device_id"
    `);

    // Hacer email y password_hash NOT NULL de nuevo
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL
    `);

    // Eliminar tablas
    await queryRunner.query(`DROP TABLE "banned_users"`);
    await queryRunner.query(`DROP TABLE "roles"`);

    // Eliminar enum
    await queryRunner.query(`DROP TYPE "public"."role_name_enum"`);
  }
}
