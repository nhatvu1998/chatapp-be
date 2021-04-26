import { Entity, Column } from 'typeorm';
import { Field, registerEnumType, ObjectType } from '@nestjs/graphql';
import { DefaultEntity } from '../../../share/interface/default.entity';
import { Expose, plainToClass } from 'class-transformer';

export enum ParticipantType {
  single,
  group,
}

registerEnumType(ParticipantType, {
  name: 'ParticipantType', // this one is mandatory
  description: 'The participant type', // this one is optional
});

@ObjectType({implements: DefaultEntity })
@Entity('participant')
export class ParticipantEntity extends DefaultEntity {
  @Field()
  @Expose()
  @Column()
  conversationId: string;

  @Field(type => [String])
  @Expose()
  @Column()
  userId: string[];

  @Field(type => Number)
  @Expose()
  @Column()
  type: number;

  constructor(participant: Partial<ParticipantEntity>) {
    super();
    if (participant) {
      Object.assign(
        this,
        plainToClass(ParticipantEntity, participant, {
          excludeExtraneousValues: true,
        }));
    }
  }
}

