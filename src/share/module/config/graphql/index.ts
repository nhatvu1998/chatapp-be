import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql';
import { join } from 'path';
import chalk from 'chalk';
import * as depthLimit from 'graphql-depth-limit';
import { ConfigService } from '../config.service';
import { UserService } from '../../../../feature/user/user.service';
import { ConversationService } from '../../../../feature/conversation/conversation.service';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  constructor(
    private configService: ConfigService,
  ) {}

  createGqlOptions(): GqlModuleOptions {
    const GRAPHQL_DEPTH_LIMIT = +this.configService.get('GRAPHQL_DEPTH_LIMIT');
    return {
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      installSubscriptionHandlers: true,
      cors: {
        origin: '*',
        credentials: true,
      },
      validationRules: [
        depthLimit(
          GRAPHQL_DEPTH_LIMIT!,
          { ignore: [/_trusted$/, 'idontcare'] },
          (depths: { [x: string]: number; }) => {
            if (depths[''] === GRAPHQL_DEPTH_LIMIT! - 1) {
              Logger.warn(
                `⚠️  You can only descend ${chalk
                  .hex('#bae7ff'!)
                  .bold(`${GRAPHQL_DEPTH_LIMIT!}`)} levels.`,
                'GraphQL',
                false,
              );
            }
          }
        )
      ],
      bodyParserConfig: { limit: '50mb' },
      context: async ({ req, connection }) => {
        if (connection) {
          return connection.context
        }
        return { req };
      },
      // subscriptions: {
      //   path: `/graphql`,
      //   keepAlive: 1000,
      //   onConnect: async (connectionParams, webSocket, context) => {
      //     let currentUser;
      //     const token = connectionParams['access-token'!];
      //     if (token) {
      //       currentUser = await this.userService.decodeToken(token);
      //       const conversations = await this.conversationService.getManyConversation(currentUser.userId);
      //       if (currentUser) {
      //         return { currentUser, conversations };
      //       }
      //       throw new UnauthorizedException('token expired!');
      //     }
      //   },
      //   onDisconnect: () => console.log('Websocket DISCONNECTED'),
      // },
    };
  }
}
