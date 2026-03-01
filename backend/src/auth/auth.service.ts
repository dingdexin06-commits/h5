import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthTokenPayload, AuthUser, UserRole } from './auth.types'
import { parseDurationSeconds, signJwt, verifyJwt } from './jwt.util'

interface DemoAccount {
  id: string
  username: string
  password: string
  name: string
  role: UserRole
  department: {
    id: string
    name: string
  }
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'u_1001',
    username: 'employee',
    password: '123456',
    name: 'Employee User',
    role: 'employee',
    department: {
      id: 'd_01',
      name: 'Product R&D'
    }
  },
  {
    id: 'u_manager_1',
    username: 'manager',
    password: '123456',
    name: 'Manager User',
    role: 'manager',
    department: {
      id: 'd_01',
      name: 'Product R&D'
    }
  }
]

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'wecom-oa-dev-secret'
  private readonly expiresInSeconds = parseDurationSeconds(process.env.JWT_EXPIRES_IN, 8 * 60 * 60)

  login(username: string | undefined, password: string | undefined): {
    accessToken: string
    tokenType: 'Bearer'
    expiresInSeconds: number
    user: AuthUser
  } {
    const normalizedUsername = username?.trim()
    const normalizedPassword = password?.trim()
    if (!normalizedUsername || !normalizedPassword) {
      throw new BadRequestException('username and password are required')
    }

    const account = DEMO_ACCOUNTS.find(
      (item) => item.username === normalizedUsername && item.password === normalizedPassword
    )
    if (!account) {
      throw new UnauthorizedException('invalid username or password')
    }

    const user = this.toAuthUser(account)
    const accessToken = signJwt(
      {
        sub: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        roles: user.roles
      },
      this.jwtSecret,
      this.expiresInSeconds
    )

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresInSeconds: this.expiresInSeconds,
      user
    }
  }

  verifyAccessToken(token: string): AuthUser {
    try {
      const payload = verifyJwt<AuthTokenPayload>(token, this.jwtSecret)
      if (!payload.sub || !payload.username || !payload.role) {
        throw new Error('payload missing user fields')
      }

      return {
        id: payload.sub,
        username: payload.username,
        name: payload.name,
        role: payload.role,
        department: payload.department,
        roles: payload.roles
      }
    } catch {
      throw new UnauthorizedException('invalid or expired token')
    }
  }

  private toAuthUser(account: DemoAccount): AuthUser {
    return {
      id: account.id,
      username: account.username,
      name: account.name,
      role: account.role,
      department: account.department,
      roles:
        account.role === 'manager'
          ? [
              { id: 'r_manager', name: 'Manager' },
              { id: 'r_report', name: 'Report Viewer' }
            ]
          : [{ id: 'r_employee', name: 'Employee' }]
    }
  }
}
