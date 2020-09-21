import { Field, InputType } from '@nestjs/graphql';
import { ParticipantType } from '../entity/participant.entity';

@InputType()
export class ParticipantInput {
  @Field()
  conversationId: string;

  @Field(type => [String])
  userId: string[];

  @Field(type => ParticipantType)
  type: ParticipantType;
}
