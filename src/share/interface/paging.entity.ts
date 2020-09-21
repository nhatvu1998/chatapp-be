import {IsInt, Min} from 'class-validator';
import {Transform} from 'class-transformer';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class PagingQuery {
  @Field()
  @Transform(value => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field()
  @Transform(value => Number(value))
  @IsInt()
  @Min(1)
  limit: number = 20;
}
