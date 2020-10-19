import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { DefaultEntity } from '../../../share/interface/default.entity';
import { Expose, plainToClass } from 'class-transformer';
import { MessageEntity } from '../../message/entity/message.entity';
import { ParticipantType } from '../../participant/entity/participant.entity';
import { UserEntity } from '../../user/entity/user.entity';

@ObjectType({implements: DefaultEntity })
@Entity('room')
export class RoomEntity extends DefaultEntity {
  @Field()
  @Expose()
  @Column()
  peerId: string;

  @Field( {nullable: true})
  @Expose()
  @Column()
  creatorId: string;

  @Field(type => [String])
  @Expose()
  @Column()
  participants: string[];

  constructor(room: Partial<RoomEntity>) {
    super();
    if (room) {
      Object.assign(
        this,
        plainToClass(RoomEntity, room, {
          excludeExtraneousValues: true,
        }));
    }
  }
}
