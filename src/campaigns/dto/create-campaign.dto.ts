import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CampaignProductDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Puntos que otorga el producto', example: 10 })
  @IsNumber()
  @Min(1)
  puntos: number;
}

export class CampaignRewardDto {
  @ApiProperty({ description: 'Descripción del premio', example: 'Remera XL' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ description: 'Puntos requeridos para canjear', example: 100 })
  @IsNumber()
  @Min(1)
  puntosRequeridos: number;

  @ApiPropertyOptional({ description: 'Cantidad disponible del premio' })
  @IsNumber()
  @IsOptional()
  cantidadDisponible?: number;
}

export class CreateCampaignDto {
  @ApiProperty({ description: 'Nombre de la campaña', example: 'Verano 2024' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Descripción de la campaña' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ description: 'Fecha de inicio', example: '2024-01-01' })
  @IsDateString()
  fechaInicio: string;

  @ApiProperty({ description: 'Fecha de fin', example: '2024-03-31' })
  @IsDateString()
  fechaFin: string;

  @ApiPropertyOptional({
    description: 'Productos de la campaña',
    type: [CampaignProductDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignProductDto)
  @IsOptional()
  productos?: CampaignProductDto[];

  @ApiPropertyOptional({
    description: 'Premios de la campaña',
    type: [CampaignRewardDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignRewardDto)
  @IsOptional()
  premios?: CampaignRewardDto[];
}
