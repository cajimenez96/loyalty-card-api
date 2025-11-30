import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Sale } from './schemas/sale.schema.js';
import { Winner } from './schemas/winner.schema.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { ClientsService } from '../clients/clients.service.js';
import { CampaignsService } from '../campaigns/campaigns.service.js';
import { ProductsService } from '../products/products.service.js';
import {
  ClientNotFoundException,
  CampaignNotActiveException,
  QrTokenNotFoundException,
} from '../common/exceptions/custom.exceptions.js';
import { nanoid } from 'nanoid';

@Injectable()
export class SalesService {
  private readonly winnerThreshold: number;

  constructor(
    @InjectModel(Sale.name) private saleModel: Model<Sale>,
    @InjectModel(Winner.name) private winnerModel: Model<Winner>,
    private clientsService: ClientsService,
    private campaignsService: CampaignsService,
    private productsService: ProductsService,
    private configService: ConfigService,
  ) {
    this.winnerThreshold =
      this.configService.get<number>('WINNER_THRESHOLD_POINTS') || 100;
  }

  async registerSale(
    createSaleDto: CreateSaleDto,
  ): Promise<{ sale: Sale; qrUrl: string; winner?: any }> {
    // 1. Find client by DNI
    const client = await this.clientsService.findByDni(createSaleDto.dni);

    // 2. Find active campaign
    const campaign = await this.campaignsService.findActive();
    if (!campaign) {
      throw new CampaignNotActiveException('No hay campaña activa');
    }

    // 3. Find product by codigo
    const product = await this.productsService.findByCodigo(
      createSaleDto.productCodigo,
    );

    // 4. Get points for this product in the campaign
    const points = await this.campaignsService.getProductPoints(
      campaign._id as Types.ObjectId,
      product._id as Types.ObjectId,
    );

    // 5. Generate unique QR token
    const qrToken = nanoid(16);

    // 6. Create sale
    const sale = new this.saleModel({
      clientId: client._id,
      campaignId: campaign._id,
      productId: product._id,
      puntos: points,
      qrToken,
    });

    await sale.save();

    // 7. Add points to client
    const campaignEndDate = new Date(campaign.fechaFin);
    await this.clientsService.addPoints(
      client._id as Types.ObjectId,
      campaign._id as Types.ObjectId,
      points,
      campaignEndDate,
    );

    // 8. Check if client reached winner threshold
    const totalPoints = await this.clientsService.getTotalPointsByCampaign(
      client._id as Types.ObjectId,
      campaign._id as Types.ObjectId,
    );

    let winnerInfo;
    if (totalPoints >= this.winnerThreshold) {
      // Check if not already a winner for this campaign
      const existingWinner = await this.winnerModel.findOne({
        clientId: client._id,
        campaignId: campaign._id,
      });

      if (!existingWinner && campaign.premios.length > 0) {
        // Select first available reward
        const reward = campaign.premios[0];

        // Generate unique winner code
        const codigoGanador = await this.generateWinnerCode();

        const winner = new this.winnerModel({
          clientId: client._id,
          campaignId: campaign._id,
          rewardId: reward._id.toString(),
          codigoGanador,
          estado: 'pendiente',
          notificationSent: false,
        });

        await winner.save();

        winnerInfo = {
          codigoGanador,
          premio: reward.descripcion,
          message: '¡Felicidades! Has ganado un premio.',
        };

        // TODO: Enqueue notification to Bull Queue
      }
    }

    const qrUrl = `/qr?token=${qrToken}`;

    return {
      sale,
      qrUrl,
      winner: winnerInfo,
    };
  }

  async getByQrToken(token: string): Promise<any> {
    const sale = await this.saleModel
      .findOne({ qrToken: token })
      .populate('clientId')
      .populate('productId')
      .populate('campaignId')
      .exec();

    if (!sale) {
      throw new QrTokenNotFoundException();
    }

    return {
      cliente: {
        nombre: (sale.clientId as any).nombre,
        apellido: (sale.clientId as any).apellido,
      },
      producto: (sale.productId as any).nombre,
      puntos: sale.puntos,
      campaña: (sale.campaignId as any).nombre,
      fecha: sale.createdAt,
    };
  }

  private async generateWinnerCode(): Promise<string> {
    const codeLength =
      this.configService.get<number>('WINNER_CODE_LENGTH') || 5;
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = this.generateRandomCode(codeLength);
      const existing = await this.winnerModel.findOne({ codigoGanador: code });
      if (!existing) {
        isUnique = true;
      }
    }

    return code!;
  }

  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
