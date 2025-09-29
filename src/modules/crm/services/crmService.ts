import { apiClient } from '../../../config/api'
import type { SearchAccountsQuery, SearchAccountsResponse } from '../../../types'

export const crmService = {
  // CRM: Search accounts
  async searchAccounts(params: SearchAccountsQuery): Promise<SearchAccountsResponse> {
    const response = await apiClient.get('/crm/search/accounts', { params })
    return response.data
  },
}


