export interface UploadDocumentResponse {
  path?: string
  message?: string
  [key: string]: unknown
}

export interface SignedUrlResponse {
  signedUrl: string
  path?: string
  expiresAt?: string
  [key: string]: unknown
}
