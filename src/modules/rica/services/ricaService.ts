import { apiClient } from '../../../config/api'
import type { UploadDocumentResponse, SignedUrlResponse } from '../../../types'

export const ricaService = {
  // RICA: Upload ID document
  async uploadId(file: File): Promise<UploadDocumentResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/rica/upload/id', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // RICA: Upload proof of address
  async uploadProofOfAddress(file: File): Promise<UploadDocumentResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/rica/upload/poa', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // RICA: Get signed URL for ID document
  async getIdSignedUrl(): Promise<SignedUrlResponse> {
    const response = await apiClient.get('/rica/document/id')
    return response.data
  },

  // RICA: Get signed URL for proof of address
  async getPoaSignedUrl(): Promise<SignedUrlResponse> {
    const response = await apiClient.get('/rica/document/poa')
    return response.data
  },
}
