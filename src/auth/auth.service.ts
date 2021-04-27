import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from 'users/schemas/user.schema';
import { RegistreDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { IJwtPayload } from './models/jwt-payload.interface';
import { Request, Response } from 'express';
import { IJWTCookies } from './models/jwt-cookies.interface';


@Injectable()
export class AuthService {
  constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>, 
      private jwtService: JwtService
    ) {}

  // REGISTER
  async register(res: Response, registerDto: RegistreDto) {
    const exist = await this.userModel.findOne({ email: registerDto.email });
    if (exist) throw new BadRequestException;
    
    try {
      const dbUser = new this.userModel(registerDto);
      dbUser.password = await bcrypt.hash(dbUser.password, 10);
      
      await dbUser.save();
      const { password, ...user} = dbUser.toObject();
      
      const { accessToken, refreshToken } = this.generateCookies({ id: user._id });
      this.asignCookies(res, accessToken, refreshToken);

      return user;
    } catch (error) {
      throw new InternalServerErrorException;
    }

  }

  // LOGIN
  async login(res: Response, loginDto: LoginDto) {
    const dbUser = await this.userModel.findOne({ email: loginDto.email });
    if (!dbUser || !await bcrypt.compare(loginDto.password, dbUser.password)) throw new BadRequestException;
    
    try {
      const { password, ...user } = dbUser.toObject();
      const { accessToken, refreshToken } = this.generateCookies({ id: user._id })
      this.asignCookies(res, accessToken, refreshToken)
      return user;
    } catch (error) {
      throw new InternalServerErrorException;
    }
  }

  // REFRESH
  async refresh(req: Request, res: Response) {
    // if no refresh token then redirect to login page
    if (
        !req.cookies[process.env.JWT_REFRESH_NAME] ||
        !this.jwtService.decode(req.cookies[process.env.JWT_REFRESH_NAME])['id']
      ) throw new UnauthorizedException
    
    try {
      const refreshToken = req.cookies[process.env.JWT_REFRESH_NAME];
      const decodedToken = this.jwtService.decode(refreshToken);

      const userId = decodedToken['id'];
      const accessToken = this.createAccessToken({ id: userId });
      
      this.asignCookies(res, accessToken, refreshToken);
      return res.sendStatus(200);      
    } catch (error) {
      throw new InternalServerErrorException;
    }
    

    
    // return res.send.status(200).message('Ok');
  }
  
  // LOGOUT
  logout(res: Response) {
    try {
      res.clearCookie(process.env.JWT_ACCESS_NAME);
      res.clearCookie(process.env.JWT_REFRESH_NAME);
      return res.sendStatus(200);
    } catch (error) {
      throw new InternalServerErrorException;
    }
  }

  // HELPERS
  createAccessToken(payload: IJwtPayload) {
    return this.jwtService.sign(payload, {expiresIn: process.env.JWT_ACCESS_EXPIRES});
  }

  createRefreshToken(payload: IJwtPayload) {
    return this.jwtService.sign(payload, {expiresIn: process.env.JWT_REFRESH_EXPIRES});
  }

  generateCookies(payload: IJwtPayload) {
    return {
      accessToken: this.createAccessToken(payload),
      refreshToken: this.createRefreshToken(payload)
    }
  }

  asignCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(process.env.JWT_ACCESS_NAME, accessToken, { httpOnly: true, maxAge: Number(process.env.JWT_ACCESS_EXPIRES), secure: true }),
    res.cookie(process.env.JWT_REFRESH_NAME, refreshToken, { httpOnly: true, maxAge: Number(process.env.JWT_REFRESH_EXPIRES), secure: true })
  }
}
