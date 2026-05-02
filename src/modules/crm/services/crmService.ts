import { apiClient } from '../../../config/api'
import type { 
  SearchAccountsQuery, 
  SearchAccountsResponse,
  CreateAccountCustomerRequest,
  CreateAccountCustomerResponse,
  GetAccountCustomerResponse,
  UpdateCustomerRequest,
} from '../../../types'

export const crmService = {
  async searchAccounts(params: SearchAccountsQuery): Promise<SearchAccountsResponse> {
    const response = await apiClient.get('/crm/search/accounts', { params })
    return response.data
  },

  async createAccountCustomer(payload: CreateAccountCustomerRequest): Promise<CreateAccountCustomerResponse> {
    const response = await apiClient.post('/crm/store/account/customer', payload)
    return response.data
  },

  async getAccountCustomer(): Promise<GetAccountCustomerResponse> {
    const response = await apiClient.get('/crm/account/customer')
    return response.data
  },

  async updateCustomer(payload: UpdateCustomerRequest): Promise<void> {
    await apiClient.patch('/crm/update/customer', payload)
  },
}


