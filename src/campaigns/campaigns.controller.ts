import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiSwaggerResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import { AddProductDto } from './dto/add-product.dto.js';
import { AddRewardDto } from './dto/add-reward.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Role } from '../common/enums/role.enum.js';

@ApiTags('campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MARKETING)
  @ApiOperation({ summary: 'Crear nueva campaña' })
  @ApiSwaggerResponse({
    status: 201,
    description: 'Campaña creada exitosamente',
  })
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  @Get()
  @Roles(Role.CAJERO, Role.ADMIN, Role.MARKETING)
  @ApiOperation({ summary: 'Listar campañas' })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['activa', 'vencida', 'próxima'],
  })
  @ApiSwaggerResponse({ status: 200, description: 'Lista de campañas' })
  async findAll(@Query('estado') estado?: string) {
    return this.campaignsService.findAll(estado);
  }

  @Get('active')
  @Roles(Role.CAJERO, Role.ADMIN)
  @ApiOperation({ summary: 'Obtener campaña activa actual' })
  @ApiSwaggerResponse({ status: 200, description: 'Campaña activa' })
  async findActive() {
    return this.campaignsService.findActive();
  }

  @Get(':id')
  @Roles(Role.CAJERO, Role.ADMIN, Role.MARKETING)
  @ApiOperation({ summary: 'Obtener campaña por ID' })
  @ApiSwaggerResponse({ status: 200, description: 'Campaña encontrada' })
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MARKETING)
  @ApiOperation({ summary: 'Actualizar campaña' })
  @ApiSwaggerResponse({ status: 200, description: 'Campaña actualizada' })
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar campaña' })
  @ApiSwaggerResponse({ status: 200, description: 'Campaña eliminada' })
  async delete(@Param('id') id: string) {
    await this.campaignsService.delete(id);
    return { message: 'Campaña eliminada exitosamente' };
  }

  @Post(':id/productos')
  @Roles(Role.ADMIN, Role.MARKETING)
  @ApiOperation({ summary: 'Agregar producto a campaña' })
  @ApiSwaggerResponse({ status: 200, description: 'Producto agregado' })
  async addProduct(
    @Param('id') id: string,
    @Body() addProductDto: AddProductDto,
  ) {
    return this.campaignsService.addProduct(id, addProductDto);
  }

  @Post(':id/premios')
  @Roles(Role.ADMIN, Role.MARKETING)
  @ApiOperation({ summary: 'Agregar premio a campaña' })
  @ApiSwaggerResponse({ status: 200, description: 'Premio agregado' })
  async addReward(@Param('id') id: string, @Body() addRewardDto: AddRewardDto) {
    return this.campaignsService.addReward(id, addRewardDto);
  }
}
