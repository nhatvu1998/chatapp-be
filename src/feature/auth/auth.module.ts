import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { jwtConstants } from './constansts/jwt.constanst';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60d' },
    }),
    UserModule,
  ],
  providers: [AuthService, AuthResolver],
  controllers: [AuthController],
})
export class AuthModule {}
