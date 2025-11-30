import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'DNI del cliente', example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Length(7, 10)
  dni: string;

  @ApiProperty({ description: 'Nombre del cliente', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Apellido del cliente', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({
    description: 'Teléfono del cliente',
    example: '+541234567890',
  })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiPropertyOptional({
    description: 'Email del cliente',
    example: 'juan@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
