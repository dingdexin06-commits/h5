import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthUser } from './auth.types'

interface RequestHeaders {
  authorization?: string
}

export interface AuthenticatedRequest {
  headers: RequestHeaders
  user: AuthUser
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const authHeader = request.headers.authorization
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('authorization header is required')
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i)
    if (!match?.[1]) {
      throw new UnauthorizedException('authorization must be Bearer token')
    }

    request.user = this.authService.verifyAccessToken(match[1].trim())
    return true
  }
}
