import { apiClient } from '../../../config/api'
import type { 
  SearchAccountsQuery, 
  SearchAccountsResponse,
  CreateAccountCustomerRequest,
  CreateAccountCustomerResponse
} from '../../../types'

export const crmService = {
  // CRM: Search accounts
  async searchAccounts(params: SearchAccountsQuery): Promise<SearchAccountsResponse> {
    const response = await apiClient.get('/crm/search/accounts', { params })
    return response.data
  },

  // RICA: Create account and customer
  async createAccountCustomer(payload: CreateAccountCustomerRequest): Promise<CreateAccountCustomerResponse> {
    const response = await apiClient.post('/crm/store/account/customer', payload)
    return response.data
  },
}


