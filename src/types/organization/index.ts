export interface OrganizationPaylaod {
  name?: string;
  domain?: string;
  logo_url?: string;
  industry?: string;
  team_size?: string;
  country_id?: string;
}

export interface OrganizationResponse {
  name?: string;
  id?: string;
  created_by?: string;
  is_active?: string;
  slug?: string;
  domain?: string;
  industry?: string;
  team_size?: string;
  country?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationUpdatePaylaod {
  name?: string;
  domain?: string;
  logo_url?: string;
  industry?: string;
  team_size?: string;
  country_id?: string;
}

export interface InviteUsersPayload {
  members: Members[];
}

export interface Members {
  email: string;
  role?: string;
}

export interface Country {
  id: string;
  name: string;
  iso2: string;
  iso3: string;
  phone_code: string;
  timezone: string | null;
  flag_emoji: string;
  created_at: string;
  updated_at: string;
}

export interface GetCountriesResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: Country[];
}
