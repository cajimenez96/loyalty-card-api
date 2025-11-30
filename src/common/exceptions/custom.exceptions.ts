import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(
    message: string,
    code: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ message, code }, statusCode);
  }
}

export class ClientNotFoundException extends CustomException {
  constructor(dni: string) {
    super(
      `Cliente con DNI ${dni} no encontrado`,
      'CLIENT_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class CampaignNotFoundException extends CustomException {
  constructor(id: string) {
    super(
      `Campaña con ID ${id} no encontrada`,
      'CAMPAIGN_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class CampaignExpiredException extends CustomException {
  constructor(campaignName: string) {
    super(
      `La campaña "${campaignName}" ha expirado`,
      'CAMPAIGN_EXPIRED',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class CampaignNotActiveException extends CustomException {
  constructor(campaignName: string) {
    super(
      `La campaña "${campaignName}" no está activa`,
      'CAMPAIGN_NOT_ACTIVE',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ProductNotFoundException extends CustomException {
  constructor(id: string) {
    super(
      `Producto con ID ${id} no encontrado`,
      'PRODUCT_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class WinnerCodeNotFoundException extends CustomException {
  constructor() {
    super(
      'Código de ganador no encontrado',
      'WINNER_CODE_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class WinnerCodeAlreadyClaimedException extends CustomException {
  constructor() {
    super(
      'Este código de ganador ya fue canjeado',
      'WINNER_CODE_ALREADY_CLAIMED',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidCredentialsException extends CustomException {
  constructor() {
    super(
      'Credenciales inválidas',
      'INVALID_CREDENTIALS',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class QrTokenNotFoundException extends CustomException {
  constructor() {
    super('Token QR no encontrado', 'QR_TOKEN_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
