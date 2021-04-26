import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsString()
  username: string;

  @Field()
  @IsString()
  password: string;
}
