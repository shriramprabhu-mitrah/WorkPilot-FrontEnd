import { ROLE_TYPE } from "."

export const ROLE_LABELS: Record<ROLE_TYPE, string> = {
    [ROLE_TYPE.ORG_ADMIN]: 'Organization Admin',
    [ROLE_TYPE.PROJECT_MANAGER]: 'Project Manager',
    [ROLE_TYPE.DEVELOPER]: 'Developer',
    [ROLE_TYPE.VIEWER]: 'Viewer',
    [ROLE_TYPE.GUEST]: 'Guest',
};