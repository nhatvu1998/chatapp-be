import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { ParticipantType } from '../../participant/entity/participant.entity';
import { FileType, MessageType } from '../entity/message.entity';
import { PagingQuery } from '../../../share/interface/paging.entity';
import { DefaultEntity } from '../../../share/interface/default.entity';

@InputType()
export class MessageInput {
  @Field()
  @IsString()
  conversationId: string;

  @Field()
  @IsString()
  senderId: string;

  @Field(type => Number)
  type: MessageType;

  @Field()
  message: string;
}

@InputType()
export class FileInfo {
  @Field()
  @IsString()
  conversationId: string;

  @Field()
  @IsString()
  senderId: string;

  @Field(type => Number)
  type: MessageType;
}

@InputType()
export class MessageQuery extends PagingQuery {
  @Field()
  @IsString()
  conversationId: string;

  @Field({ nullable: true })
  searchText: string;
}

@InputType()
export class SignalData {
  @Field({ nullable: true } )
  type: string;

  @Field({ nullable: true } )
  sdp: string;
}

@InputType()
export class SignalDataReceiver {
  @Field({ nullable: true } )
  renegotiate: boolean;

  @Field({ nullable: true } )
  type: string;

  @Field({ nullable: true } )
  sdp: string;
}
