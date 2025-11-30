import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class PointEntry {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true })
  cantidad: number;

  @Prop({ required: true })
  fechaVencimiento: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ required: true, unique: true, index: true })
  dni: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true })
  telefono: string;

  @Prop()
  email?: string;

  @Prop({ type: [PointEntry], default: [] })
  puntos: PointEntry[];

  createdAt: Date;
  updatedAt: Date;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

// Indexes for performance
ClientSchema.index({ dni: 1 }, { unique: true });
ClientSchema.index({ 'puntos.campaignId': 1 });
ClientSchema.index({ createdAt: -1 });
