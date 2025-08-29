import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AppLoginDto } from './dto/app-login.dto';
import { AppLoginResponseDto } from './dto/app-login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('app-login')
  async appLogin(
    @Body() appLoginDto: AppLoginDto,
  ): Promise<AppLoginResponseDto> {
    console.log('appLogin', appLoginDto);
    return this.authService.appLogin(appLoginDto);
  }
}
