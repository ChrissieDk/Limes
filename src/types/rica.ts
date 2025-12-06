export interface UploadDocumentResponse {
  path?: string
  message?: string
  [key: string]: any
}

export interface SignedUrlResponse {
  signedUrl: string
  path?: string
  expiresAt?: string
  [key: string]: any
}
