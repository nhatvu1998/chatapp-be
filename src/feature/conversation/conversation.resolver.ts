import { Args, Mutation, PickType, Query, Resolver } from '@nestjs/graphql';
import { ConversationService } from './conversation.service';
import { ConversationEntity } from './entity/conversation.entity';
import { ConversationInput } from './inputs/conversation.input';

@Resolver('Conversation')
export class ConversationResolver {
  constructor(private readonly conversationService: ConversationService) {
  }

  @Query(returns => [ConversationEntity])
  async getManyConversation(@Args('userId') userId: string) {
    return this.conversationService.getManyConversation(userId);
  }

  @Mutation(returns => ConversationEntity)
  async createConversation(@Args('conversationInput') conversationInput: ConversationInput) {
    return this.conversationService.createConversation(conversationInput.title, conversationInput.creatorId, conversationInput.participantMembers, conversationInput.type);
  }
}
