import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { DefaultEntity } from '../../../share/interface/default.entity';
import { Expose, plainToClass } from 'class-transformer';
import { MessageEntity } from '../../message/entity/message.entity';
import { ParticipantType } from '../../participant/entity/participant.entity';

@ObjectType({implements: DefaultEntity })
@Entity('conversation')
export class ConversationEntity extends DefaultEntity {
  @Field()
  @Expose()
  @Column()
  title: string;

  @Field()
  @Expose()
  @Column()
  creatorId: string;

  @Field( type => MessageEntity, {nullable: true})
  @Expose()
  @Column()
  firstMessage: MessageEntity;

  @Field( {nullable: true})
  @Expose()
  @Column()
  senderId: string;

  @Field()
  @Column()
  type: ParticipantType;

  constructor(conversation: Partial<ConversationEntity>) {
    super();
    if (conversation) {
      Object.assign(
        this,
        plainToClass(ConversationEntity, conversation, {
          excludeExtraneousValues: true,
        }));
    }
  }
}

