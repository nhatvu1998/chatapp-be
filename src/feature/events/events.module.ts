import { Module } from '@nestjs/common';
import { EventsGateway } from './events.getaway';

@Module({
  providers: [EventsGateway],
})
export class EventsModule {}
