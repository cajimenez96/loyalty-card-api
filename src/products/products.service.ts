import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ProductNotFoundException } from '../common/exceptions/custom.exceptions.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productModel.findOne({
      codigo: createProductDto.codigo,
    });

    if (existingProduct) {
      throw new ConflictException({
        message: 'Ya existe un producto con este código',
        code: 'PRODUCT_ALREADY_EXISTS',
      });
    }

    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find({ activo: true }).sort({ nombre: 1 }).exec();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    return product;
  }

  async findByCodigo(codigo: string): Promise<Product> {
    const product = await this.productModel.findOne({ codigo });

    if (!product) {
      throw new ProductNotFoundException(codigo);
    }

    return product;
  }
}
