import { Entity, Column, ObjectIdColumn } from 'typeorm';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { DefaultEntity } from '../../../share/interface/default.entity';
import { Expose, plainToClass } from 'class-transformer';

export enum MessageType {
  text,
  image,
  audio,
  video,
  file,
}

registerEnumType(MessageType, {
  name: 'MessageType', // this one is mandatory
  description: 'The message type', // this one is optional
});
@ObjectType()
export class FileType {
  @Field({ nullable: true } )
  key: string;

  @Field({ nullable: true } )
  url: string;

  @Field({ nullable: true } )
  name: string;
}

@ObjectType()
export class SignalDataResponse {
  @Field({ nullable: true } )
  renegotiate: boolean;

  @Field({ nullable: true } )
  type: string;

  @Field({ nullable: true } )
  sdp: string;
}

@ObjectType()
export class SignalDataResponseReceiver {
  @Field({ nullable: true } )
  renegotiate: boolean;
}

@ObjectType({implements: DefaultEntity })
@Entity('message')
export class MessageEntity extends DefaultEntity {
  @Field()
  @Expose()
  @Column()
  conversationId: string;

  @Field()
  @Expose()
  @Column()
  senderId: string;

  @Field(type => MessageType)
  @Expose()
  @Column()
  type: MessageType;

  @Field()
  @Expose()
  @Column()
  message: string;

  @Field( type => FileType, { nullable: true } )
  @Expose()
  @Column({default: []})
  files: FileType;

  constructor(user: Partial<MessageEntity>) {
    super();
    if (user) {
      Object.assign(
        this,
        plainToClass(MessageEntity, user, {
          excludeExtraneousValues: true,
        }));
    }
  }
}
