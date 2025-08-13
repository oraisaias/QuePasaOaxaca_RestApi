import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1755116657166 implements MigrationInterface {
    name = 'InitialMigration1755116657166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categorias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "descripcion" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "evento_categorias" ("evento_id" uuid NOT NULL, "categoria_id" uuid NOT NULL, CONSTRAINT "PK_7e83958c361e02951f4a9604e64" PRIMARY KEY ("evento_id", "categoria_id"))`);
        await queryRunner.query(`CREATE TABLE "user_favorites" ("user_id" uuid NOT NULL, "event_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_466bba6b1a0d607b54ea9351d51" PRIMARY KEY ("user_id", "event_id"))`);
        await queryRunner.query(`CREATE TABLE "device_favorites" ("device_id" character varying NOT NULL, "event_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c8c1cbdd32b060ed8a45dd35025" PRIMARY KEY ("device_id", "event_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'archived')`);
        await queryRunner.query(`CREATE TABLE "eventos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying NOT NULL, "descripcion" character varying, "imagen_url" character varying, "fecha_inicio" TIMESTAMP WITH TIME ZONE NOT NULL, "fecha_fin" TIMESTAMP WITH TIME ZONE, "lat" numeric(9,6), "lng" numeric(9,6), "direccion_texto" character varying, "precio" numeric(10,2), "enlace_externo" character varying, "status" "public"."event_status" NOT NULL DEFAULT 'draft', "created_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "published_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_40d4a3c6a4bfd24280cb97a509e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" citext NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."user_role" NOT NULL DEFAULT 'admin', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "evento_categorias" ADD CONSTRAINT "FK_a6be9ab6e4c721083654fbf8e4a" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "evento_categorias" ADD CONSTRAINT "FK_c933e7f5817c6efb1755fa13d72" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD CONSTRAINT "FK_5238ce0a21cc77dc16c8efe3d36" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD CONSTRAINT "FK_7f16bd4bb181ed508dfcd4c53be" FOREIGN KEY ("event_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "device_favorites" ADD CONSTRAINT "FK_04bcc87b13cf41a83f200c755d0" FOREIGN KEY ("event_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "eventos" ADD CONSTRAINT "FK_27911a7222cc39a6b2d5938ee69" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "eventos" DROP CONSTRAINT "FK_27911a7222cc39a6b2d5938ee69"`);
        await queryRunner.query(`ALTER TABLE "device_favorites" DROP CONSTRAINT "FK_04bcc87b13cf41a83f200c755d0"`);
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_7f16bd4bb181ed508dfcd4c53be"`);
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_5238ce0a21cc77dc16c8efe3d36"`);
        await queryRunner.query(`ALTER TABLE "evento_categorias" DROP CONSTRAINT "FK_c933e7f5817c6efb1755fa13d72"`);
        await queryRunner.query(`ALTER TABLE "evento_categorias" DROP CONSTRAINT "FK_a6be9ab6e4c721083654fbf8e4a"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_role"`);
        await queryRunner.query(`DROP TABLE "eventos"`);
        await queryRunner.query(`DROP TYPE "public"."event_status"`);
        await queryRunner.query(`DROP TABLE "device_favorites"`);
        await queryRunner.query(`DROP TABLE "user_favorites"`);
        await queryRunner.query(`DROP TABLE "evento_categorias"`);
        await queryRunner.query(`DROP TABLE "categorias"`);
    }

}
