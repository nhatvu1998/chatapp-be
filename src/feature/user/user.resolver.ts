import { Args, Query, Resolver, Context, Mutation, Subscription } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserEntity } from './entity/user.entity';
import { RegisterInput } from '../auth/inputs/register.input';
import { UpdateUserInput } from './inputs/user.input';
import { MessageEntity } from '../message/entity/message.entity';

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Query(returns => UserEntity)
  async getUser(@Args('id') id: string) {
    return this.userService.findOne(id);
  }

  @Query(returns => [UserEntity])
  async getUsers() {
    return this.userService.getUsers();
  }

  @Query(returns => UserEntity)
  async getProfile(@Context('user') user: any) {
    return this.userService.findOne(user.userId);
  }

  @Mutation(returns => UserEntity)
  async updateUser(@Args('userData') userData: UpdateUserInput) {
    return this.userService.updateUser(userData._id, {
      username: userData.username,
      fullname: userData.fullname,
      email: userData.email,
      isOnline: userData.isOnline,
    });
  }
}
