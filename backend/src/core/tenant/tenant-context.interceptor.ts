import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tenantContext } from './tenant.context';
import { REQUIRE_WORKSPACE_KEY } from './require-workspace.decorator';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const requireWorkspace = this.reflector.getAllAndOverride<boolean>(REQUIRE_WORKSPACE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireWorkspace) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const organizationId = request.workspace?.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('Workspace context is required for this operation');
    }

    return new Observable((subscriber) => {
      tenantContext.run({ organizationId }, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}