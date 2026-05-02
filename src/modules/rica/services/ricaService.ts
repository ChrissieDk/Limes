import { apiClient } from '../../../config/api'
import type { UploadDocumentResponse, SignedUrlResponse } from '../../../types'

export const ricaService = {
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

  async getIdSignedUrl(): Promise<SignedUrlResponse> {
    const response = await apiClient.get('/rica/document/id')
    return response.data
  },

  async getPoaSignedUrl(): Promise<SignedUrlResponse> {
    const response = await apiClient.get('/rica/document/poa')
    return response.data
  },
}
