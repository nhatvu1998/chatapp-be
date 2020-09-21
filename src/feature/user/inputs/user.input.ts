import { IsEmail, IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

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
  @IsEmail()
  email: string;

  @Field({nullable: true})
  @IsOptional()
  @IsEmail()
  isOnline: boolean;
}
