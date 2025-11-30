import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/role.enum.js';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, select: false })
  pin: string;

  @Prop({ required: true, enum: Role })
  role: Role;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, enum: ['activo', 'inactivo'], default: 'activo' })
  estado: string;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for faster queries
UserSchema.index({ nombre: 1 });
