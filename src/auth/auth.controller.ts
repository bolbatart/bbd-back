import { Controller, Post, Body, Res, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistreDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body() registerDto: RegistreDto,
    @Res({ passthrough: true }) res: Response
    ) {
    return this.authService.register(res, registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    ) {
    return this.authService.login(res, loginDto);
  }

  @Get('refresh')
  refresh(
    @Req() req: Request,
    @Res() res: Response
  ) {
    return this.authService.refresh(req, res);
  }

  @Get('logout')
  logout(
    @Res() res: Response
  ) {
    return this.authService.logout(res);
  }
}
