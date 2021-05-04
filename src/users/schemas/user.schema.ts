import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SpawnSyncOptionsWithStringEncoding } from 'child_process';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
class ResetPaswordToken extends Document {
  @Prop()
  token: string;

  @Prop()
  expiresIn: string;
}

const ResetPaswordTokenSchema = SchemaFactory.createForClass(ResetPaswordToken);


@Schema()
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  jobPosition?: string;

  @Prop()
  location?: string;

  @Prop()
  website?: string[];

  @Prop()
  bio?: string;

  @Prop()
  email: string;
  
  @Prop()
  password: string;

  @Prop({ type: ResetPaswordTokenSchema })
  resetToken: {
    token: string;
    expiresIn: Date;
  }

}

export const UserSchema = SchemaFactory.createForClass(User);