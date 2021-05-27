import { Injectable } from "@nestjs/common";
import { ElasticsearchModuleOptions, ElasticsearchOptionsFactory } from "@nestjs/elasticsearch";
import { ConfigService } from "../config.service";

@Injectable()
export class ElasticsearchConfigService implements ElasticsearchOptionsFactory {
  constructor(private configService: ConfigService) {}
  async createElasticsearchOptions(): Promise<ElasticsearchModuleOptions> {
    console.log(this.configService.get('ELASTICSEARCH_NODE'));
    
    return {
      node: this.configService.get('ELASTICSEARCH_NODE'),
      maxRetries: 10,
      requestTimeout: 60000,
    };
  }
}
