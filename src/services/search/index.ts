import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { GlobalSearchData } from '@/src/types/search';

class SearchService {
  async globalSearch(query: string): Promise<ApiResponse<GlobalSearchData>> {
    const url = ApiEndpoints.Search.globalSearch.withQuery({ q: query });
    return apiService.get<GlobalSearchData>(url, { showErrorToast: false });
  }
}

export const searchService = new SearchService();
