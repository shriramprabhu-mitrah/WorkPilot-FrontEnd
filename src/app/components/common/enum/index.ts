export enum ProjectFilter {
  ALL = 'All',
  ACTIVE = 'Active',
  PLANNING = 'Planning',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
}

export const filters = [
  ProjectFilter.ALL,
  ProjectFilter.ACTIVE,
  ProjectFilter.PLANNING,
  ProjectFilter.ON_HOLD,
  ProjectFilter.COMPLETED,
];

export enum INDUSTRY_TYPE {
  IT = 'Information_Technology',
  FINANCE = 'Finance',
  HEALTHCARE = 'Healthcare',
  EDUCATION = 'Education',
  MANUFACTURING = 'Manufacturing',
  RETAIL = 'Retail',
  REAL_ESTATE = 'Real Estate',
  LOGISTICS = 'Logistics',
  HOSPITALITY = 'Hospitality',
  OTHER = 'Other',
}

export enum COMPANY_SIZE {
  SIZE_1_10 = '1-10',
  SIZE_11_50 = '11-50',
  SIZE_51_200 = '51-200',
  SIZE_201_500 = '201-500',
  SIZE_501_1000 = '501-1000',
  SIZE_1000_PLUS = '1000+',
}

export enum ROLE_TYPE {
  ORG_ADMIN = 'org_admin',
  PROJECT_MANAGER = 'project_manager',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

export const ROLE_LABELS: Record<ROLE_TYPE, string> = {
  [ROLE_TYPE.ORG_ADMIN]: 'Organization Admin',
  [ROLE_TYPE.PROJECT_MANAGER]: 'Project Manager',
  [ROLE_TYPE.DEVELOPER]: 'Developer',
  [ROLE_TYPE.VIEWER]: 'Viewer',
  [ROLE_TYPE.GUEST]: 'Guest',
};
