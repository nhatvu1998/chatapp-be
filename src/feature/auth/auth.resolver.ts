import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RegisterInput } from './inputs/register.input';
import { LoginInput } from './inputs/login.input';
import { UserEntity } from '../user/entity/user.entity';
import { AccessToken, UserSession } from '../../share/interface/session.interface';
import { PubSub } from 'graphql-subscriptions';
import { Public } from '../../share/decorator/public.decorator';

const pubsub = new PubSub();
@Resolver('Auth')
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // @Query()
  // async getPermissionByUserId(@Args('userId') userId: number) {
  //   return this.authService.getPermissionsByUserId(userId);
  // }
  @Public()
  @Mutation(() => UserEntity)
  async register(@Args('userData') userData: RegisterInput) {
    return this.userService.createUser(userData);
  }

  @Public()
  @Mutation(() => AccessToken)
  async login(@Args('userData') userData: LoginInput) {
    return this.authService.createToken(userData);
  }

  @Public()
  @Mutation(() => AccessToken)
  async logout(@Args('id') id: string) {
    return this.authService.logout(id);
  }
}
