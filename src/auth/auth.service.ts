import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from 'users/schemas/user.schema';
import { RegistreDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { IJwtPayload } from './models/jwt-payload.interface';


@Injectable()
export class AuthService {
  constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>, 
      private jwtService: JwtService
    ) {}

  async register(registerDto: RegistreDto) {
    // check if user exists
    const exist = await this.userModel.findOne({ email: registerDto.email });
    if (exist) throw new BadRequestException;
    try {
      const dbUser = new this.userModel(registerDto);
      // create jwt tokens
      // insert jwt tokens to the httpOnly cookie
      // hash users password
      dbUser.password = await bcrypt.hash(dbUser.password, 10);
      // save user into the database
      await dbUser.save();
      // return user
      const { password, ...userToReturn} = dbUser.toObject();
      return userToReturn; 
    } catch (error) {
      throw new InternalServerErrorException;
    }

  }

  async login(loginDto: LoginDto) {
    // findOne in the db and compare hashed passwords - if doesnt exist -> badrequest
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user || !await bcrypt.compare(loginDto.password, user.password)) throw new BadRequestException;
    // create jwt cookies
    const cookies = this.generateCookies({email: user.email, id: user._id});
    
    // return user
    const { password, ...userToReturn } = user.toObject();
    return {
      user: userToReturn, 
      cookies
    };
  }

  // forgotPassword
  
  //
  
  generateCookies(payload: IJwtPayload) {
    return {
      access_token: this.jwtService.sign(payload, {expiresIn: process.env.JWT_ACCESS_EXPIRES}),
      refresh_token: this.jwtService.sign(payload, {expiresIn: process.env.JWT_REFRESH_EXPIRES})
    }
  } 
}
