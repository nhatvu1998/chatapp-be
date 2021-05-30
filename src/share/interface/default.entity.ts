import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Field, InterfaceType } from '@nestjs/graphql';
import { v1 as uuid } from 'uuid';

@InterfaceType()
export abstract class DefaultEntity {
  @Field()
  @Expose()
  @ObjectIdColumn()
  _id: string;

  @Field()
  @Expose()
  @Column()
  createdAt: number;

  @Field()
  @Expose()
  @Column()
  updatedAt: number;

  @BeforeInsert()
  async addId() {
    this._id = uuid();
    this.createdAt = +new Date();
    this.updatedAt = +new Date();
  }
}
