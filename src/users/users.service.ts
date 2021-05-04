import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>,
      private jwtService: JwtService
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
    const token = req.cookies[process.env.JWT_ACCESS_NAME];
    const userId = this.jwtService.decode(token)['id'];
    
    const dbUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true, useFindAndModify: false });
    if (dbUser) {
      const {password, resetToken, ...user} = dbUser.toObject();
      return user;
    } else throw new InternalServerErrorException;
    
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndRemove(id);
  }
}
