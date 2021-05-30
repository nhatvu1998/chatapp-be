import { Module, OnModuleInit } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule } from 'src/share/module/config/config.module';
import { ElasticsearchConfigService } from 'src/share/module/config/elasticsearch';
import { SearchService } from './search.service';

@Module({
    imports: [
        ElasticsearchModule.registerAsync({
        imports: [ConfigModule],
        useClass: ElasticsearchConfigService
        })
    ],
    providers: [SearchService],
    exports: [ElasticsearchModule, SearchService],
    })
    export class SearchModule implements OnModuleInit {
    constructor(private readonly searchService: SearchService) {}
    public async onModuleInit() {
        await this.searchService.createIndex();
    }
}
