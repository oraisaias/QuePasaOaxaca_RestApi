import { IsString, IsNotEmpty } from 'class-validator';

export class AppLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Device ID es requerido' })
  deviceId: string;
}
