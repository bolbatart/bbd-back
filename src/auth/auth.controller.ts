import { Controller, Post, Body, Res, Get, Req, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { RegistreDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

  @Post('forgotpassword')
  forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto
  ) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Put('reset/:key')
  resetPassword(
    @Param('key') key: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    return this.authService.resetPassword(resetPasswordDto, key);
  }
}

