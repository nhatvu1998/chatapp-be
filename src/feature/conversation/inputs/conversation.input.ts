import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { ParticipantType } from '../../participant/entity/participant.entity';

@InputType()
export class ConversationInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  creatorId: string;

  @Field(type => [String])
  participantMembers: string[];

  @Field(type => ParticipantType)
  type: ParticipantType;
}
