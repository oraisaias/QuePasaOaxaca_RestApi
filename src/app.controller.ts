import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ENDPOINT TEMPORAL - ELIMINAR DESPUÉS DE USAR
  // @Post('setup-admin')
  // async setupAdmin() {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   try {
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();

  //     // 1. Verificar y crear roles si no existen
  //     const roles = [
  //       { name: 'admin', description: 'Administrador del sistema' },
  //       { name: 'app_user', description: 'Usuario de la aplicación móvil' },
  //       { name: 'app_user_logged', description: 'Usuario de la aplicación móvil registrado' },
  //     ];

  //     for (const role of roles) {
  //       const existingRole = await queryRunner.query(
  //         `SELECT id FROM roles WHERE name = $1 LIMIT 1`,
  //         [role.name]
  //       );

  //       if (existingRole.length === 0) {
  //         await queryRunner.query(
  //           `INSERT INTO roles (name, description, created_at, updated_at)
  //            VALUES ($1, $2, NOW(), NOW())`,
  //           [role.name, role.description]
  //         );
  //         console.log(`Rol ${role.name} creado`);
  //       }
  //     }

  //     // 2. Obtener el ID del rol admin
  //     const adminRole = await queryRunner.query(
  //       `SELECT id FROM roles WHERE name = 'admin' LIMIT 1`,
  //     );

  //     if (adminRole.length === 0) {
  //       throw new Error('Rol admin no encontrado después de la creación');
  //     }

  //     const adminRoleId = adminRole[0].id;

  //     // 2. Verificar si ya existe un usuario admin
  //     const existingAdmin = await queryRunner.query(
  //       `SELECT id FROM users WHERE email = 'admin@quepasaoaxaca.com' LIMIT 1`
  //     );

  //     if (existingAdmin.length > 0) {
  //       throw new Error('Usuario administrador ya existe');
  //     }

  //     // 3. Generar hash de la contraseña
  //     const password = 'admin123456';
  //     const saltRounds = 12;
  //     const passwordHash = await bcrypt.hash(password, saltRounds);

  //     // 4. Insertar usuario administrador
  //     const insertResult = await queryRunner.query(
  //       `INSERT INTO users (email, password_hash, role_id, created_at, updated_at)
  //        VALUES ($1, $2, $3, NOW(), NOW())
  //        RETURNING id, email, created_at`,
  //       ['admin@quepasaoaxaca.com', passwordHash, adminRoleId]
  //     );

  //     await queryRunner.commitTransaction();

  //     return {
  //       success: true,
  //       message: 'Usuario administrador creado exitosamente',
  //       user: {
  //         id: insertResult[0].id,
  //         email: insertResult[0].email,
  //         role: 'admin',
  //         password: password, // Solo para mostrar en la respuesta
  //         createdAt: insertResult[0].created_at
  //       },
  //       credentials: {
  //         email: 'admin@quepasaoaxaca.com',
  //         password: password
  //       }
  //     };

  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
