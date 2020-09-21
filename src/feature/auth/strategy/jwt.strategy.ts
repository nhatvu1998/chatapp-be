import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import {
  JWTPayload,
  UserSession,
} from 'src/share/interface/session.interface';
import { jwtConstants } from '../constansts/jwt.constanst';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JWTPayload): Promise<UserSession> {
    const user = await this.userService.findOne(payload.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return {
      userId: user._id,
      roles: payload.roles,
    };
  }
}
