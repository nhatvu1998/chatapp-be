import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ParticipantService } from './participant.service';
import { ParticipantEntity } from './entity/participant.entity';
import { ParticipantInput } from './inputs/participant.input';

@Resolver('Participant')
export class ParticipantResolver {
  constructor(private readonly participantService: ParticipantService) {
  }

  @Mutation(returns => ParticipantEntity)
  async addParticipant(@Args('participantInput') participantInput: ParticipantInput) {
    return this.participantService.addParticipant(participantInput.conversationId, 123, participantInput.userId);
  }
}
