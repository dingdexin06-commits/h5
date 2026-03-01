export type UserRole = 'manager' | 'employee'

export interface UserDepartment {
  id: string
  name: string
}

export interface UserRoleInfo {
  id: string
  name: string
}

export interface AuthUser {
  id: string
  username: string
  name: string
  role: UserRole
  department: UserDepartment
  roles: UserRoleInfo[]
}

export interface AuthTokenPayload {
  sub: string
  username: string
  name: string
  role: UserRole
  department: UserDepartment
  roles: UserRoleInfo[]
  iat: number
  exp: number
}
