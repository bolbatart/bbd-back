import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import { Request, Response } from 'express';

import { User, UserDocument } from 'users/schemas/user.schema';
import { RegistreDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { IJwtPayload } from './models/jwt-payload.interface';
import { addMintutesToTime } from 'helper';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { UsersService } from 'users/users.service';



@Injectable()
export class AuthService {
  constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>, 
      private jwtService: JwtService,
      private userService: UsersService
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
      const { password, resetToken, ...user } = dbUser.toObject();
      const { accessToken, refreshToken } = this.generateCookies({ id: user._id })
      this.asignCookies(res, accessToken, refreshToken)
      return user;
    } catch (error) {
      throw new InternalServerErrorException;
    }
  }

  // REFRESH-TOKEN
  async refresh(req: Request, res: Response) {
    // todo
    // if nor user in the database then throw unauth. exception
    const token = req.cookies[process.env.JWT_REFRESH_NAME];
    const userId = this.jwtService.decode(req.cookies[process.env.JWT_REFRESH_NAME])['id'];
    if (
        !token ||
        !userId ||
        !await this.userService.findById(userId) 
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

  // FORGOT-PASSWORD
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: forgotPasswordDto.email });
    if (!user) throw new BadRequestException;
    try {
      const token = uuidv4();
      const expiresIn = addMintutesToTime(new Date(), 15);
      user.resetToken = { token, expiresIn };
      await user.save();
      await this.sendLinkToEmail(token, user.email)
      return true;
    } catch (error) {
      throw new InternalServerErrorException;
    }
  }

  // RESET-PASSWORD
  async resetPassword(resetPasswordDto: ResetPasswordDto, key: string) {
    const dbUser = await this.userModel.findOne({ email: resetPasswordDto.email });
    if (!dbUser || new Date(dbUser.resetToken.expiresIn) < new Date()) throw new BadRequestException;
    
    try {
      dbUser.password = await bcrypt.hash(resetPasswordDto.password, 10);
      await dbUser.save();

      return true;
    } catch (error) {
      throw new InternalServerErrorException;
      
    }
  }

  // HELPERS
  createAccessToken(payload: IJwtPayload) {
    return this.jwtService.sign(payload, { expiresIn: process.env.JWT_ACCESS_EXPIRES, secret: process.env.JWT_SECRET });
  }

  createRefreshToken(payload: IJwtPayload) {
    return this.jwtService.sign(payload, { expiresIn: process.env.JWT_REFRESH_EXPIRES, secret: process.env.JWT_SECRET });
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

  async sendLinkToEmail(key: string, email: string) {

    const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

    async function sendMail() {
      try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'oAuth2',
            user: 'artiombolbat123@gmail.com',
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken
          }
        })

        const mailOptions = {
          from: 'BBD Project <artiombolbat123@gmail.com>',
          to: 'bolbatartiom@gmail.com',
          subject: 'Hello from gmail using API',
          text: 'Hello from gmail using API',
          html: `<a href='http://localhost:3000/reset/${key}'>Click here</a>`
        }

        const result = await transport.sendMail(mailOptions);
        return result;

      } catch (error) {
        return error;
      }
    }

    return sendMail();
  }
}
