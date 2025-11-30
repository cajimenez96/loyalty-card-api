import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty({ description: 'DNI del cliente', example: '12345678' })
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiProperty({ description: 'Código del producto', example: 'PROD001' })
  @IsString()
  @IsNotEmpty()
  productCodigo: string;
}
