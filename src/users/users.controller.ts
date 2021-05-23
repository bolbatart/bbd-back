import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';


import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { ApiFile } from 'common/decorators/api-file.decorator';
import { fileUploadOptions } from 'common/configs/fileUploadOptions'

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(
    @Req() req: Request
  ) {
    return this.usersService.getMe(req);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  
  @Patch(':id')
  updateById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request
    ) {
    return await this.usersService.updateMe(req, updateUserDto);
  }

  @Put('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @UseInterceptors(FileInterceptor('file', fileUploadOptions))
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ) {
    return await this.usersService.updateAvatar(req, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
