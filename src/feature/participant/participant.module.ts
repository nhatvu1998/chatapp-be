import { Module } from '@nestjs/common';
import { ParticipantResolver } from './participant.resolver';
import { ParticipantService } from './participant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantEntity } from './entity/participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParticipantEntity])],
  providers: [ParticipantResolver, ParticipantService],
})
export class ParticipantModule {}
