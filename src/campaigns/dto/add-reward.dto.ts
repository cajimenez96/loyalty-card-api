import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddRewardDto {
  @ApiProperty({
    description: 'Descripción del premio',
    example: 'Gorra deportiva',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ description: 'Puntos requeridos', example: 50 })
  @IsNumber()
  @Min(1)
  puntosRequeridos: number;

  @ApiPropertyOptional({ description: 'Cantidad disponible' })
  @IsNumber()
  @IsOptional()
  cantidadDisponible?: number;
}
