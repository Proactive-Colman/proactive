import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headerSecret = request.headers['x-internal-secret'] as string | undefined;
    const expectedSecret = process.env.INTERNAL_SECRET;

    if (!expectedSecret) {
      throw new UnauthorizedException('Internal secret not configured');
    }

    if (!headerSecret || headerSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid internal secret');
    }

    return true;
  }
}


