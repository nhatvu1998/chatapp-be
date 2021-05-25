import { Args, Mutation, ResolveField, Parent, Query, Resolver } from '@nestjs/graphql';
import { ParticipantEntity } from '../participant/entity/participant.entity';
import { ParticipantService } from '../participant/participant.service';
import { ConversationService } from './conversation.service';
import { ConversationEntity } from './entity/conversation.entity';
import { ConversationInput } from './inputs/conversation.input';

@Resolver((of) => ConversationEntity)
export class ConversationResolver {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly participantService: ParticipantService,
  ) {}
  @Query((returns) => [ConversationEntity])
  async getManyConversation(@Args('userId') userId: string) {
    return this.conversationService.getManyConversation(userId);
  }

  @Mutation((returns) => ConversationEntity)
  async createConversation(
    @Args('conversationInput') conversationInput: ConversationInput,
  ) {

    return this.conversationService.createConversation(
      conversationInput.creatorId,
      conversationInput.participantMembers,
      conversationInput.type,
      conversationInput.title,
    );
  }

  @Mutation((returns) => Boolean)
  async deleteConversation(@Args('conversationId') conversationId: string) {
    return this.conversationService.deleteConversation(conversationId);
  }

  @ResolveField()
  async participants(@Parent() conversation: ConversationEntity) {
    const { _id } = conversation;
    return this.participantService.getParticipant(_id);
  }
}
