import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import chalk from 'chalk';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getArgs()[3]) {
      const parentType = context.getArgs()[3].parentType;
      // const fieldName = chalk
      //   .hex('#bae7ff'!)
      //   .bold(`${context.getArgs()[3].fieldName}`);
      return next.handle().pipe(
        tap(() => {
          Logger.debug(`⛩  ${parentType} » ${context.getArgs()[3].fieldName}`, 'GraphQL');
        }),
      );
    } else {
      // const parentType = chalk
      //   .hex('#bae7ff'!)
      //   .bold(`${context.getArgs()[0].route.path}`);
      // const fieldName = chalk
      //   .hex('#bae7ff'!)
      //   .bold(`${context.getArgs()[0].route.stack[0].method}`);
      return next.handle().pipe(
        tap(() => {
          Logger.debug(`⛩  ${context.getArgs()[0].route.path} » ${context.getArgs()[0].route.stack[0].method}`, 'GraphQL');
        }),
      );
    }
  }
}
