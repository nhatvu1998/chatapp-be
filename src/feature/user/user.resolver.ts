import { Args, Query, Resolver, Context, Mutation, Subscription } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserEntity } from './entity/user.entity';
import { RegisterInput } from '../auth/inputs/register.input';
import { UpdateUserInput } from './inputs/user.input';
import { MessageEntity } from '../message/entity/message.entity';
import { GraphQLUpload } from 'apollo-server-express';
import { ReadStream } from 'fs-capacitor';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): ReadStream
  ;
}

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

  @Mutation(returns => MessageEntity)
  async updateUser(@Args({name: 'avatarFile', type: () => GraphQLUpload!}) avatarFile: FileUpload, @Args('userData') userData: UpdateUserInput) {
    return await this.userService.updateUser(userData._id, {
      username: userData.username,
      fullname: userData.fullname,
      phone: userData.phone,
      gender: userData.gender,
      isOnline: userData.isOnline,
    }, avatarFile);
  }
}
