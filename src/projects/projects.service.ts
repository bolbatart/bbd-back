import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request, Response } from 'express';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project, ProjectDocument } from './schemas/project.schema';
import { UsersService } from 'users/users.service';
import { AuthService } from 'auth/auth.service';


@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private userService: UsersService,
    private authService: AuthService
  ) { }

  async create(req: Request, createProjectDto: CreateProjectDto) {
    const userId = this.authService.getIdFromAccessToken(req);

    try {
      const today = new Date();
      const dbProject = new this.projectModel(createProjectDto);
      dbProject.author = userId;
      dbProject.timestamp = today;
      await dbProject.save();

      const project = dbProject.toObject();

      return project;
    } catch (error) {
      throw InternalServerErrorException;
    }
  }

  async get(skip: number, limit: number, area?: string, name?: string, location?: string) {
    try {
        const dbFilterQuery = {
          name: name ? { $regex: name } : { $type: 2 },
          area: area ? { $regex: area } : { $type: 2 },
          location: location ? { $regex: location } : { $type: 2 }
        };
        const projects = (await this.projectModel.find(dbFilterQuery).limit(Number(limit)).skip(Number(skip))).map(pr => ({
          id: pr._id,
          name: pr.name,
          area: pr.area,
          shortDescription: pr.shortDescription,
          availablePositions: pr.availablePositions,
          location: pr.location,
        })) 

        return {
            results: projects,
            meta: {
                skip,
                limit,
                total: await this.projectModel.countDocuments(dbFilterQuery)
            }
        } 
    } catch (error) {
      throw InternalServerErrorException;
    }
  }

  async getById(id: string) {
    try {
      const dbProject = await this.projectModel.findById(id);
      const dbAuthor = await this.userService.findById(dbProject.author);

      const project = dbProject.toObject();
      const author = {
        firstName: dbAuthor.firstName,
        lastName: dbAuthor.lastName,
        email: dbAuthor.email,
        jobPosition: dbAuthor.jobPosition,
        location: dbAuthor.location
      }

      return { project, author };
    } catch (error) {
      throw InternalServerErrorException;
    }
  }

  async getLastWeek() {
    try {
      const thisWeekProjects = await this.projectModel.find({ timestamp: {
        $gte: new Date((new Date()).getTime() - 7 * 60 * 60 * 24 * 100)
      } })
      return thisWeekProjects;
    } catch (error) {
      throw InternalServerErrorException;
    }
  }

  async remove(id: string) {
    try {
      await this.projectModel.findByIdAndRemove(id);
      return true;
    } catch (error) {
      throw InternalServerErrorException;
    }
  }
}
