import { IsEmail, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'apollo-server-express';
import { type } from 'os';
import { FileUpload } from '../../message/message.resolver';
import { UserGender } from '../entity/user.entity';

@InputType()
export class UpdateUserInput {
  @Field()
  @IsString()
  _id: string;

  @Field({nullable: true})
  @IsOptional()
  @IsString()
  username: string;

  @Field({nullable: true})
  @IsOptional()
  @IsString()
  fullname: string;

  @Field({nullable: true})
  @IsOptional()
  phone: string;

  @Field(() => Number,{nullable: true})
  @IsOptional()
  gender: UserGender;

  @Field(() => GraphQLUpload!,{nullable: true})
  @IsOptional()
  avatarFile: FileUpload;

  @Field({nullable: true})
  @IsOptional()
  @IsEmail()
  isOnline: boolean;
}
