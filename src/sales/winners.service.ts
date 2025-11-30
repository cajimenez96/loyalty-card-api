import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Winner } from './schemas/winner.schema.js';
import { ClaimRewardDto } from './dto/claim-reward.dto.js';
import {
  WinnerCodeNotFoundException,
  WinnerCodeAlreadyClaimedException,
} from '../common/exceptions/custom.exceptions.js';

@Injectable()
export class WinnersService {
  constructor(@InjectModel(Winner.name) private winnerModel: Model<Winner>) {}

  async findAll(
    estado?: string,
    dni?: string,
    campaignId?: string,
  ): Promise<Winner[]> {
    const filter: any = {};

    if (estado) {
      filter.estado = estado;
    }

    if (campaignId) {
      filter.campaignId = campaignId;
    }

    const winners = await this.winnerModel
      .find(filter)
      .populate('clientId')
      .populate('campaignId')
      .sort({ createdAt: -1 })
      .exec();

    // Filter by DNI if provided (after population)
    if (dni) {
      return winners.filter((w) => (w.clientId as any).dni === dni);
    }

    return winners;
  }

  async claimReward(claimRewardDto: ClaimRewardDto): Promise<any> {
    const winner = await this.winnerModel
      .findOne({ codigoGanador: claimRewardDto.codigoGanador })
      .populate('clientId')
      .populate('campaignId')
      .exec();

    if (!winner) {
      throw new WinnerCodeNotFoundException();
    }

    if (winner.estado === 'canjeado') {
      throw new WinnerCodeAlreadyClaimedException();
    }

    // Update winner status
    winner.estado = 'canjeado';
    winner.fechaCanje = new Date();
    await winner.save();

    // Get reward details from campaign
    const campaign = winner.campaignId as any;
    const reward = campaign.premios.find(
      (p: any) => p._id.toString() === winner.rewardId,
    );

    return {
      message: 'Premio canjeado exitosamente',
      cliente: {
        nombre: (winner.clientId as any).nombre,
        apellido: (winner.clientId as any).apellido,
        dni: (winner.clientId as any).dni,
      },
      premio: reward?.descripcion || 'Premio',
      codigoGanador: winner.codigoGanador,
      fechaCanje: winner.fechaCanje,
    };
  }
}
