import { IsEmail, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterInput {
  @Field()
  @IsString()
  username: string;

  @Field()
  @IsString()
  password: string;

  @Field()
  @IsString()
  passwordCheck: string;

  @Field()
  @IsOptional()
  @IsString()
  fullname: string;

  @Field()
  @IsOptional()
  @IsEmail()
  email: string;
}
