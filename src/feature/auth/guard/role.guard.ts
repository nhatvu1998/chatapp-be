import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserService } from 'src/feature/user/user.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<string[]>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }
    try {
      const gqlCtx = GqlExecutionContext.create(context);
      const { authorization } = gqlCtx.getContext().req.headers;
      if (!authorization) { return false; }
      const res = await this.userService.decodeToken(authorization);
      gqlCtx.getContext().user = { userId: res.userId };
      return true;
    } catch (err) {
      return false;
    }
  }
}
