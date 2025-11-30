import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiSwaggerResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SalesService } from './sales.service.js';
import { WinnersService } from './winners.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { ClaimRewardDto } from './dto/claim-reward.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Role } from '../common/enums/role.enum.js';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CAJERO, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar venta y generar QR' })
  @ApiSwaggerResponse({
    status: 201,
    description: 'Venta registrada exitosamente',
  })
  async registerSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.registerSale(createSaleDto);
  }

  @Get('qr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener datos de venta por token QR (público)' })
  @ApiQuery({ name: 'token', required: true })
  @ApiSwaggerResponse({ status: 200, description: 'Datos de venta obtenidos' })
  @ApiSwaggerResponse({ status: 404, description: 'Token QR no encontrado' })
  async getByQr(@Query('token') token: string) {
    return this.salesService.getByQrToken(token);
  }
}

@ApiTags('winners')
@Controller('winners')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WinnersController {
  constructor(private readonly winnersService: WinnersService) {}

  @Get()
  @Roles(Role.CAJERO, Role.ADMIN, Role.MARKETING)
  @ApiOperation({ summary: 'Listar ganadores' })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['pendiente', 'canjeado'],
  })
  @ApiQuery({ name: 'dni', required: false })
  @ApiQuery({ name: 'campaignId', required: false })
  @ApiSwaggerResponse({ status: 200, description: 'Lista de ganadores' })
  async findAll(
    @Query('estado') estado?: string,
    @Query('dni') dni?: string,
    @Query('campaignId') campaignId?: string,
  ) {
    return this.winnersService.findAll(estado, dni, campaignId);
  }

  @Post('claim')
  @Roles(Role.CAJERO, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Canjear premio con código ganador' })
  @ApiSwaggerResponse({
    status: 200,
    description: 'Premio canjeado exitosamente',
  })
  @ApiSwaggerResponse({
    status: 404,
    description: 'Código ganador no encontrado',
  })
  @ApiSwaggerResponse({ status: 400, description: 'Premio ya canjeado' })
  async claimReward(@Body() claimRewardDto: ClaimRewardDto) {
    return this.winnersService.claimReward(claimRewardDto);
  }
}
