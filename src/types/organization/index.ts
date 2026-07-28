export interface OrganizationPaylaod {
  name?: string;
  domain?: string;
  logo_url?: string;
  industry?: string;
  team_size?: string;
  country?: string;
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
  logo_url?: string;
}

export interface InviteUsersPayload {
  members: Members[];
}

export interface Members {
  email: string;
  role: string;
}
