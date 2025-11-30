import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Campaign } from './schemas/campaign.schema.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import { AddProductDto } from './dto/add-product.dto.js';
import { AddRewardDto } from './dto/add-reward.dto.js';
import {
  CampaignNotFoundException,
  CampaignNotActiveException,
  ProductNotFoundException,
} from '../common/exceptions/custom.exceptions.js';
import { ProductsService } from '../products/products.service.js';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
    private productsService: ProductsService,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const fechaInicio = new Date(createCampaignDto.fechaInicio);
    const fechaFin = new Date(createCampaignDto.fechaFin);

    if (fechaInicio >= fechaFin) {
      throw new BadRequestException({
        message: 'La fecha de inicio debe ser anterior a la fecha de fin',
        code: 'INVALID_CAMPAIGN_DATES',
      });
    }

    const campaign = new this.campaignModel({
      ...createCampaignDto,
      fechaInicio,
      fechaFin,
    });

    return campaign.save();
  }

  async findAll(estado?: string): Promise<Campaign[]> {
    const campaigns = await this.campaignModel
      .find()
      .sort({ fechaInicio: -1 })
      .exec();

    if (estado) {
      return campaigns.filter((c) => c.estado === estado);
    }

    return campaigns;
  }

  async findActive(): Promise<Campaign | null> {
    const campaigns = await this.campaignModel.find().exec();
    const activeCampaigns = campaigns.filter((c) => c.estado === 'activa');

    return activeCampaigns.length > 0 ? activeCampaigns[0] : null;
  }

  async findById(id: string): Promise<Campaign> {
    if (!Types.ObjectId.isValid(id)) {
      throw new CampaignNotFoundException(id);
    }

    const campaign = await this.campaignModel.findById(id).exec();

    if (!campaign) {
      throw new CampaignNotFoundException(id);
    }

    return campaign;
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
    const campaign = await this.findById(id);

    if (updateCampaignDto.fechaInicio && updateCampaignDto.fechaFin) {
      const fechaInicio = new Date(updateCampaignDto.fechaInicio);
      const fechaFin = new Date(updateCampaignDto.fechaFin);

      if (fechaInicio >= fechaFin) {
        throw new BadRequestException({
          message: 'La fecha de inicio debe ser anterior a la fecha de fin',
          code: 'INVALID_CAMPAIGN_DATES',
        });
      }
    }

    Object.assign(campaign, updateCampaignDto);
    return campaign.save();
  }

  async delete(id: string): Promise<void> {
    const campaign = await this.findById(id);
    await campaign.deleteOne();
  }

  async addProduct(
    campaignId: string,
    addProductDto: AddProductDto,
  ): Promise<Campaign> {
    const campaign = await this.findById(campaignId);

    // Verify product exists
    await this.productsService.findById(addProductDto.productId);

    const productExists = campaign.productos.some(
      (p) => p.productId.toString() === addProductDto.productId,
    );

    if (productExists) {
      throw new BadRequestException({
        message: 'El producto ya está agregado a esta campaña',
        code: 'PRODUCT_ALREADY_IN_CAMPAIGN',
      });
    }

    campaign.productos.push({
      productId: new Types.ObjectId(addProductDto.productId),
      puntos: addProductDto.puntos,
    } as any);

    return campaign.save();
  }

  async addReward(
    campaignId: string,
    addRewardDto: AddRewardDto,
  ): Promise<Campaign> {
    const campaign = await this.findById(campaignId);

    campaign.premios.push(addRewardDto as any);

    return campaign.save();
  }

  async getProductPoints(
    campaignId: Types.ObjectId,
    productId: Types.ObjectId,
  ): Promise<number> {
    const campaign = await this.campaignModel.findById(campaignId);

    if (!campaign) {
      throw new CampaignNotFoundException(campaignId.toString());
    }

    if (campaign.estado !== 'activa') {
      throw new CampaignNotActiveException(campaign.nombre);
    }

    const product = campaign.productos.find(
      (p) => p.productId.toString() === productId.toString(),
    );

    if (!product) {
      throw new ProductNotFoundException(productId.toString());
    }

    return product.puntos;
  }

  async validateCampaignActive(campaignId: Types.ObjectId): Promise<Campaign> {
    const campaign = await this.campaignModel.findById(campaignId);

    if (!campaign) {
      throw new CampaignNotFoundException(campaignId.toString());
    }

    if (campaign.estado !== 'activa') {
      throw new CampaignNotActiveException(campaign.nombre);
    }

    return campaign;
  }
}
