import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class CampaignProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  puntos: number;
}

export class CampaignReward {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  puntosRequeridos: number;

  @Prop()
  cantidadDisponible?: number;
}

export type CampaignStatus = 'activa' | 'vencida' | 'próxima';

@Schema({ timestamps: true })
export class Campaign extends Document {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  fechaInicio: Date;

  @Prop({ required: true })
  fechaFin: Date;

  @Prop({ type: [CampaignProduct], default: [] })
  productos: CampaignProduct[];

  @Prop({ type: [CampaignReward], default: [] })
  premios: CampaignReward[];

  createdAt: Date;
  updatedAt: Date;

  // Virtual para estado computado
  get estado(): CampaignStatus {
    const now = new Date();
    if (now < this.fechaInicio) return 'próxima';
    if (now > this.fechaFin) return 'vencida';
    return 'activa';
  }
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

// Ensure virtuals are included in JSON
CampaignSchema.set('toJSON', { virtuals: true });
CampaignSchema.set('toObject', { virtuals: true });

// Indexes
CampaignSchema.index({ fechaInicio: 1, fechaFin: 1 });
CampaignSchema.index({ nombre: 1 });
