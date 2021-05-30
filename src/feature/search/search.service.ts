import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from 'src/share/module/config/config.service';

@Injectable()
export class SearchService {
    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly configService: ConfigService,
    ) {}
    // tslint:disable-next-line:no-big-function
    public async createIndex() {
        const index = this.configService.get('ELASTICSEARCH_INDEX');
        const checkIndex = await this.elasticsearchService.indices.exists({ index });
        // tslint:disable-next-line:early-exit
        if (checkIndex.statusCode === 404) {
        this.elasticsearchService.indices.create(
            {
            index,
            body: {
                mappings: {
                    properties: {
                        message: {
                            type: 'text',
                        },
                        createdAt: {
                            type: 'number',
                        },
                    },
                },
            },
            },
            (err: any) => {
            if (err) {
                console.log(err);
            }
            },
        );
        }
    }
    public async indexMessage(message: any) {
        return await this.elasticsearchService.index({
            index: this.configService.get('ELASTICSEARCH_INDEX')!,
            body: message,
        });
    }

    async search(text: string) {
        const { body } = await this.elasticsearchService.search({
        index: this.configService.get('ELASTICSEARCH_INDEX'),
        body: {
            query: {
            multi_match: {
                query: text,
                fields: ['message', 'content'],
            },
            },
        },
        });
        return body
    }
}
