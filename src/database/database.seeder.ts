import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service.js';
import { Role } from '../common/enums/role.enum.js';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const env = this.configService.get<string>('NODE_ENV');

    if (env === 'development') {
      this.logger.log('🌱 Seeding database...');
      await this.seedUsers();
      this.logger.log('✅ Database seeded successfully');
    }
  }

  private async seedUsers() {
    try {
      // Crear usuario admin por defecto
      await this.authService.createUser('Admin', '1234', Role.ADMIN);
      this.logger.log('Created admin user (PIN: 1234)');

      // Crear usuario cajero por defecto
      await this.authService.createUser('Cajero 1', '5678', Role.CAJERO);
      this.logger.log(' Created cajero user (PIN: 5678)');

      // Crear usuario marketing por defecto
      await this.authService.createUser('Marketing', '9012', Role.MARKETING);
      this.logger.log('Created marketing user (PIN: 9012)');
    } catch (error: any) {
      // Users might already exist
      if (error.code !== 11000) {
        this.logger.error('Error seeding users:', error.message);
      }
    }
  }
}
