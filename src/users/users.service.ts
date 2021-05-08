import { forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>,
      @Inject(forwardRef(() => AuthService))
      private authService: AuthService,
      private jwtService: JwtService,
    ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, {new: true});
  }

  async updateMe(req: Request, updateUserDto: UpdateUserDto) {
    const userId = this.authService.getIdFromAccessToken(req);

    const dbUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true, useFindAndModify: false });
    if (dbUser) {
      const {password, resetToken, ...user} = dbUser.toObject();
      return user;
    } else throw new InternalServerErrorException;
    
  }

  async updateAvatar(req: Request, file: Express.Multer.File) {
    const userId = this.authService.getIdFromAccessToken(req);

    try {
      await this.userModel.findByIdAndUpdate(userId, { avatar: file.filename }, { useFindAndModify: true });
      return true;
    } catch (error) {
      throw new InternalServerErrorException;
    }
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndRemove(id);
  }
}
