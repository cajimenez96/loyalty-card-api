import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimRewardDto {
  @ApiProperty({
    description: 'Código ganador de 5 caracteres',
    example: 'ABC12',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 5)
  codigoGanador: string;
}
