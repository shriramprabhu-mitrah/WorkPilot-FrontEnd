import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { ApiResponse } from '@/src/types/core';
import type { GlobalSearchData, SearchCategory } from '@/src/types/search';
import { apiService } from '../axios';

export interface GlobalSearchParams {
  query: string;
  category?: SearchCategory;
  page?: number;
  pageSize?: number;
}

const CATEGORY_PARAM: Record<Exclude<SearchCategory, 'all'>, string> = {
  tasks: 'tasks',
  user_stories: 'user_stories',
  projects: 'projects',
  members: 'members',
  sprints: 'sprints',
};

class SearchService {
  async globalSearch({
    query,
    category = 'all',
    page = 1,
    pageSize = 10,
  }: GlobalSearchParams): Promise<ApiResponse<GlobalSearchData>> {
    const params: Record<string, string | number> = {
      q: query,
      page,
      page_size: pageSize,
    };

    if (category !== 'all') {
      params.category = CATEGORY_PARAM[category];
    }

    const url = ApiEndpoints.Search.globalSearch.withQuery(params);
    return apiService.get<GlobalSearchData>(url, { showErrorToast: false });
  }
}

export const searchService = new SearchService();
