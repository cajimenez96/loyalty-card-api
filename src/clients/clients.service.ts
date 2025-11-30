import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client } from './schemas/client.schema.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';
import { ClientNotFoundException } from '../common/exceptions/custom.exceptions.js';

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private clientModel: Model<Client>) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const existingClient = await this.clientModel.findOne({
      dni: createClientDto.dni,
    });

    if (existingClient) {
      throw new ConflictException({
        message: 'Ya existe un cliente con este DNI',
        code: 'CLIENT_ALREADY_EXISTS',
      });
    }

    const client = new this.clientModel(createClientDto);
    return client.save();
  }

  async findAll(
    limit: number = 20,
    skip: number = 0,
  ): Promise<{ clients: Client[]; total: number }> {
    const [clients, total] = await Promise.all([
      this.clientModel
        .find()
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .exec(),
      this.clientModel.countDocuments(),
    ]);

    return { clients, total };
  }

  async findByDni(dni: string): Promise<Client> {
    const client = await this.clientModel.findOne({ dni });

    if (!client) {
      throw new ClientNotFoundException(dni);
    }

    return client;
  }

  async findById(id: string): Promise<Client> {
    if (!Types.ObjectId.isValid(id)) {
      throw new ClientNotFoundException(id);
    }

    const client = await this.clientModel.findById(id);

    if (!client) {
      throw new ClientNotFoundException(id);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findById(id);

    if (updateClientDto.dni && updateClientDto.dni !== client.dni) {
      const existingClient = await this.clientModel.findOne({
        dni: updateClientDto.dni,
      });
      if (existingClient) {
        throw new ConflictException({
          message: 'Ya existe un cliente con este DNI',
          code: 'CLIENT_ALREADY_EXISTS',
        });
      }
    }

    Object.assign(client, updateClientDto);
    return client.save();
  }

  async getPoints(
    id: string,
  ): Promise<{ totalPoints: number; pointsByCampaign: any[] }> {
    const client = await this.findById(id);

    const now = new Date();
    const validPoints = client.puntos.filter(
      (p) => new Date(p.fechaVencimiento) > now,
    );

    const totalPoints = validPoints.reduce((sum, p) => sum + p.cantidad, 0);

    const pointsByCampaign = validPoints.reduce(
      (acc, point) => {
        const campaignId = point.campaignId.toString();
        if (!acc[campaignId]) {
          acc[campaignId] = {
            campaignId,
            puntos: 0,
            fechaVencimiento: point.fechaVencimiento,
          };
        }
        acc[campaignId].puntos += point.cantidad;
        return acc;
      },
      {} as Record<string, any>,
    );

    return {
      totalPoints,
      pointsByCampaign: Object.values(pointsByCampaign),
    };
  }

  async addPoints(
    clientId: string | Types.ObjectId,
    campaignId: Types.ObjectId,
    cantidad: number,
    fechaVencimiento: Date,
  ): Promise<Client> {
    const id = typeof clientId === 'string' ? clientId : clientId.toString();
    const client = await this.findById(id);

    client.puntos.push({
      campaignId,
      cantidad,
      fechaVencimiento,
      createdAt: new Date(),
    } as any);

    return client.save();
  }

  async getTotalPointsByCampaign(
    clientId: Types.ObjectId,
    campaignId: Types.ObjectId,
  ): Promise<number> {
    const client = await this.clientModel.findById(clientId);

    if (!client) {
      return 0;
    }

    const now = new Date();
    const campaignPoints = client.puntos.filter(
      (p) =>
        p.campaignId.toString() === campaignId.toString() &&
        new Date(p.fechaVencimiento) > now,
    );

    return campaignPoints.reduce((sum, p) => sum + p.cantidad, 0);
  }
}
