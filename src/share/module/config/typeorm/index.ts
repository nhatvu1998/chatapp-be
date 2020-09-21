import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { ConfigService } from '../config.service';

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {

  constructor(
    private configService: ConfigService,
  ) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const username = this.configService.get('DB_USERNAME');
    const password = this.configService.get('DB_PASSWORD');
    const database = this.configService.get('DB_NAME');
    return {
      type: 'mongodb',
      url: `mongodb+srv://${username}:${password}@cluster0-u91zw.mongodb.net/${database}`,
      entities: getMetadataArgsStorage().tables.map(tbl => tbl.target),
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }
}
