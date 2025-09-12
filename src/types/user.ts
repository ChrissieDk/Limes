export interface User {
  id: string
  externalId: string
  emailAddress: string
  displayName: string
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
