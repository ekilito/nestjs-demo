import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

function isStandardResponse(
  value: unknown,
): value is { code: unknown; success: unknown; message: unknown } {
  if (!value || typeof value !== 'object') return false;
  return 'code' in value && 'success' in value && 'message' in value;
}

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (isStandardResponse(data)) return data;
        return {
          code: HttpStatus.OK,
          message: 'success',
          success: true,
          data: data ?? null,
        };
      }),
    );
  }
}
