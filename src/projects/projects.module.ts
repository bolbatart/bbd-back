import { forwardRef, Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { UsersModule } from 'users/users.module';
import { AuthModule } from 'auth/auth.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Project.name, schema: ProjectSchema
      }
    ]),
    UsersModule,
    AuthModule
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}
