import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { Country } from '@/src/types/organization';

class countryService {
  async getCountryList(params?: { name?: string }): Promise<ApiResponse<Country[]>> {
    const url = ApiEndpoints.Country.getCountry.url;
    const query = params?.name ? `?name=${encodeURIComponent(params.name)}` : '';

    return apiService.get<Country[]>(`${url}${query}`);
  }
}

export const CountryService = new countryService();