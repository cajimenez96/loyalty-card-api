import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Winner extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Client', required: true, index: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true, index: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true })
  rewardId: string;

  @Prop({ required: true, unique: true, index: true, length: 5 })
  codigoGanador: string;

  @Prop({
    required: true,
    enum: ['pendiente', 'canjeado'],
    default: 'pendiente',
  })
  estado: string;

  @Prop()
  fechaCanje?: Date;

  @Prop({ default: false })
  notificationSent: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const WinnerSchema = SchemaFactory.createForClass(Winner);

// Indexes
WinnerSchema.index({ codigoGanador: 1 }, { unique: true });
WinnerSchema.index({ clientId: 1, campaignId: 1 });
WinnerSchema.index({ estado: 1 });
