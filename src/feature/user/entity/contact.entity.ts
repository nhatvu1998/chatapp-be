// import { Entity, Column } from 'typeorm';
// import { Field, ObjectType } from '@nestjs/graphql';
// import { Expose, plainToClass } from 'class-transformer';
// import { DefaultEntity } from '../../../share/interface/default.entity';
//
// @ObjectType({implements: DefaultEntity })
// @Entity('contact')
// export class ContactEntity extends DefaultEntity {
//   @Field()
//   @Expose()
//   @Column()
//   firstname: string;
//
//   @Field()
//   @Expose()
//   @Column()
//   lastname: string;
//
//   @Field()
//   @Expose()
//   @Column()
//   address: string;
//
//   @Field()
//   @Expose()
//   @Column({ nullable: true })
//   email?: string;
//
//   @Field()
//   @Expose()
//   @Column()
//   isOnline: boolean = false;
//
//   constructor(user: Partial<UserEntity>) {
//     super();
//     if (user) {
//       Object.assign(
//         this,
//         plainToClass(UserEntity, user, {
//           excludeExtraneousValues: true,
//         }));
//     }
//   }
// }
