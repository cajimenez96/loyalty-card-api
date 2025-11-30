import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesController, WinnersController } from './sales.controller.js';
import { SalesService } from './sales.service.js';
import { WinnersService } from './winners.service.js';
import { Sale, SaleSchema } from './schemas/sale.schema.js';
import { Winner, WinnerSchema } from './schemas/winner.schema.js';
import { ClientsModule } from '../clients/clients.module.js';
import { CampaignsModule } from '../campaigns/campaigns.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: Winner.name, schema: WinnerSchema },
    ]),
    ClientsModule,
    CampaignsModule,
    ProductsModule,
  ],
  controllers: [SalesController, WinnersController],
  providers: [SalesService, WinnersService],
  exports: [SalesService, WinnersService],
})
export class SalesModule {}
