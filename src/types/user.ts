export interface User {
  id: string
  externalId: string
  emailAddress: string
  displayName: string
}

export interface CreateUserRequest {
  externalId: string
  emailAddress: string
  firstName: string
  lastName: string
}

export interface CreateUserResponse {
  externalId: string
  emailAddress: string
  firstName: string
  lastName: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface SignUpData {
  phone: string
  email: string
  password: string
  confirmPassword: string
  terms: boolean
}
