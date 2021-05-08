import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema()
export class Project {
  @Prop()
  name: string;

  @Prop()
  area: string;

  @Prop()
  location: string;

  @Prop()
  shortDescription: string;

  @Prop()
  description: string;

  @Prop()
  author: string;

  @Prop()
  likes?: string[];

  @Prop()
  availablePositions?: string[];
  
  @Prop()
  budget?: string;

  @Prop()
  comments?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);


