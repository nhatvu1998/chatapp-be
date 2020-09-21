import { Field, InterfaceType , ObjectType} from '@nestjs/graphql';

export interface JWTPayload {
  userId: string;
  roles: number[];
  username: string;
  isAdmin: boolean;
}

@InterfaceType()
export abstract class UserSession {
  @Field()
  userId: string;

  roles: number[];
}

@ObjectType()
export class AccessToken {
  @Field()
  token: string;
}
