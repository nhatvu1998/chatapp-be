import { Module, CacheModule, CacheInterceptor } from '@nestjs/common';
import { AuthModule } from './feature/auth/auth.module';
import { UserModule } from './feature/user/user.module';
import { GqlConfigService } from './share/module/config/graphql';
import { ConfigModule } from './share/module/config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeormConfigService } from './share/module/config/typeorm';
import { UsersResolver } from './feature/user/user.resolver';
import { JwtStrategy } from './feature/auth/strategy/jwt.strategy';
import { MessageModule } from './feature/message/message.module';
import { ConversationModule } from './feature/conversation/conversation.module';
import { ParticipantModule } from './feature/participant/participant.module';
import { RoleGuard } from './feature/auth/guard/role.guard';
import { EventsModule } from './feature/events/events.module';
import { CacheConfigService } from './share/module/config/caching';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeormConfigService,
    }),
    GraphQLModule.forRootAsync({
      imports: [UserModule, ConversationModule],
      useClass: GqlConfigService,
    }),
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   useClass: CacheConfigService,
    // }),
    AuthModule,
    UserModule,
    MessageModule,
    ConversationModule,
    ParticipantModule,
    EventsModule,
  ],
  providers: [
    UsersResolver,
    JwtStrategy,
    RoleGuard,
  ],
})
export class AppModule {}
