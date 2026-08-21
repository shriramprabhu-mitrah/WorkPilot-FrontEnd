export enum ProjectFilter {
  ALL = 'All',
  ACTIVE = 'Active',
  PLANNING = 'Planning',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  ARCHIVED = 'Archived',
}

export const filters = [
  ProjectFilter.ALL,
  ProjectFilter.ACTIVE,
  ProjectFilter.PLANNING,
  ProjectFilter.ON_HOLD,
  ProjectFilter.COMPLETED,
  ProjectFilter.CANCELLED,
  ProjectFilter.ARCHIVED,
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
  MEMBER = 'member',
  PROJECT_MANAGER = 'project_manager',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
  QA = 'tester',
}

/** Org-level roles stored in state.user.role */
export const ORG_ROLES = [ROLE_TYPE.ORG_ADMIN, ROLE_TYPE.MEMBER] as const;

/** Project-level roles stored in selectedProject.members[].role */
export const PROJECT_ROLES = [
  ROLE_TYPE.PROJECT_MANAGER,
  ROLE_TYPE.DEVELOPER,
  ROLE_TYPE.VIEWER,
  ROLE_TYPE.QA,
] as const;

export const ROLE_LABELS: Record<ROLE_TYPE, string> = {
  [ROLE_TYPE.ORG_ADMIN]: 'Organization Admin',
  [ROLE_TYPE.MEMBER]: 'Member',
  [ROLE_TYPE.PROJECT_MANAGER]: 'Project Manager',
  [ROLE_TYPE.DEVELOPER]: 'Developer',
  [ROLE_TYPE.VIEWER]: 'Viewer',
  [ROLE_TYPE.QA]: 'QA',
};

export enum TASK_TYPE {
  BUG = 'bug',
  FEATURE = 'feature',
  TASK = 'task',
  CHORE = 'chore',
  STORY = 'story',
}

export const taskTypeOptions = [
  { label: 'Bug', value: TASK_TYPE.BUG },
  { label: 'Feature', value: TASK_TYPE.FEATURE },
  { label: 'Task', value: TASK_TYPE.TASK },
  { label: 'Chore', value: TASK_TYPE.CHORE },
  { label: 'Story', value: TASK_TYPE.STORY },
];

export enum PRIORITY_TYPE {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export const priorityOptions = [
  { label: 'Low', value: PRIORITY_TYPE.LOW },
  { label: 'Medium', value: PRIORITY_TYPE.MEDIUM },
  { label: 'High', value: PRIORITY_TYPE.HIGH },
  { label: 'Critical', value: PRIORITY_TYPE.CRITICAL },
];
