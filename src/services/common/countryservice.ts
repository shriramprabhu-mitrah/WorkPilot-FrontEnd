import { ApiEndpoints } from '@/src/lib/constants/api-endpoints';
import { apiService } from '../axios';
import { ApiResponse } from '@/src/types/core';
import { Country } from '@/src/types/organization';

class countryService {
  async getCountryList(): Promise<ApiResponse<Country[]>> {
    const url = ApiEndpoints.Country.getCountry.url;

    return apiService.get<Country[]>(url);
  }
}

export const CountryService = new countryService();
