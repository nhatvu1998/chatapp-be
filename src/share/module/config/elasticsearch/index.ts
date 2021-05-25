import { ElasticsearchModuleOptions, ElasticsearchOptionsFactory } from "@nestjs/elasticsearch";

class ElasticsearchConfigService implements ElasticsearchOptionsFactory {
  createElasticsearchOptions(): ElasticsearchModuleOptions {
    return {
      node: 'http://localhost:9200',
    };
  }
}
