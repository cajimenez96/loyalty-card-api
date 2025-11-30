import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Role } from '../common/enums/role.enum.js';

@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(Role.CAJERO, Role.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  @ApiResponse({ status: 409, description: 'Cliente con DNI ya existe' })
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @Roles(Role.CAJERO, Role.ADMIN, Role.MARKETING)
  @ApiOperation({ summary: 'Listar todos los clientes' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Lista de clientes obtenida' })
  async findAll(@Query('limit') limit?: string, @Query('skip') skip?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedSkip = skip ? parseInt(skip, 10) : 0;

    const { clients, total } = await this.clientsService.findAll(
      parsedLimit,
      parsedSkip,
    );

    return {
      data: clients,
      meta: {
        page: Math.floor(parsedSkip / parsedLimit) + 1,
        limit: parsedLimit,
        total,
      },
    };
  }

  @Get('dni/:dni')
  @Roles(Role.CAJERO, Role.ADMIN)
  @ApiOperation({ summary: 'Buscar cliente por DNI' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findByDni(@Param('dni') dni: string) {
    return this.clientsService.findByDni(dni);
  }

  @Get(':id')
  @Roles(Role.CAJERO, Role.ADMIN, Role.MARKETING)
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @Get(':id/puntos')
  @Roles(Role.CAJERO, Role.ADMIN, Role.MARKETING)
  @ApiOperation({ summary: 'Obtener puntos del cliente' })
  @ApiResponse({ status: 200, description: 'Puntos del cliente obtenidos' })
  async getPoints(@Param('id') id: string) {
    return this.clientsService.getPoints(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }
}
