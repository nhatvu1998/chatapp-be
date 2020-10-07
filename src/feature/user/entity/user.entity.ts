import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { DefaultEntity } from '../../../share/interface/default.entity';
import { Expose, plainToClass } from 'class-transformer';
import { FileUpload } from '../../message/message.resolver';
import { GraphQLUpload } from 'apollo-server-express';
import { FileType } from '../../message/entity/message.entity';

@ObjectType({implements: DefaultEntity })
@Entity('user')
export class UserEntity extends DefaultEntity {
  @Field()
  @Expose()
  @Column()
  username: string;

  @Field()
  @Expose()
  @Column()
  password: string;

  @Field()
  @Expose()
  @Column()
  fullname?: string;

  @Field()
  @Expose()
  @Column()
  firstname: string;

  @Field()
  @Expose()
  @Column()
  lastname: string;

  @Field()
  @Expose()
  @Column({ nullable: true })
  email?: string;

  @Field()
  @Expose()
  @Column({ nullable: true })
  phone?: string;

  @Field()
  @Expose()
  @Column({ nullable: true })
  gender?: UserGender;

  @Field(() => FileType, {nullable: true})
  @Expose()
  @Column({ nullable: true })
  avatarFile?: FileType;

  @Field()
  @Expose()
  @Column()
  isOnline: boolean = false;

  constructor(user: Partial<UserEntity>) {
    super();
    if (user) {
      Object.assign(
        this,
        plainToClass(UserEntity, user, {
          excludeExtraneousValues: true,
        }));
    }
  }
}

export enum UserGender {
  male,
  female,
}
