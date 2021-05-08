import { Controller, Post, Body, Res, Get, Req, Param, Put, UseGuards, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';


@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: Request
    ) {
    return await this.projectsService.create(req, createProjectDto);
  }

  @Get(':skip/:limit')
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'area', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  async get(
    @Param('skip') skip: number,
    @Param('limit') limit: number,
    @Query('name') name: string,
    @Query('area') area: string,
    @Query('location') location: string,
  ) {
    return await this.projectsService.get(skip, limit, area, name, location);
  }

  @Get()
  async getById (
    @Param('id') id: string
  ) {
    return await this.projectsService.getById(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
  ) {
    return await this.projectsService.remove(id);
  }
  // @Patch()
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateProjectDto: UpdateProjectDto,
  // ) {

  // }

}
