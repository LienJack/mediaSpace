import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, { code: number; msg: string; data: T | null }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ code: number; msg: string; data: T | null }> {
    return next.handle().pipe(
      map((data: T | null) => ({
        code: 200,
        msg: '成功',
        data: data ?? null,
      })),
    );
  }
}
