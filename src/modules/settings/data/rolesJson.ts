import {
  Crown,
  Building2,
  BriefcaseBusiness,
  Code2,
  Eye,
  CheckCircle2,
  XCircle,
  UserMinus,
  UserPlus,
  Plus,
} from 'lucide-react';

export const rolesData = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    number: 1,
    icon: Crown,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    borderColor: 'border-purple-200',
    cardBg: 'bg-purple-50',
    activeBg: 'bg-purple-50',
    scope: 'Platform-wide',

    description:
      'The highest-privilege account holder. Typically the founder or CTO of the company using Trackr.',

    capabilities: [
      'Manage all organizations on the platform',
      'Create or delete any organization',
      'Assign or revoke Organization Admin roles',
      'Access platform-level billing & settings',
      'View all audit logs across all orgs',
      'Override any permission in emergency',
    ],

    restrictions: [
      'Actions are immutable and logged permanently',
      'Cannot be demoted except by another Super Admin',
    ],

    analogyTitle: 'Real-World Analogy',

    analogyDescription:
      'The AWS root account — all-powerful, rarely used, should be locked away safely.',
  },

  {
    id: 'organization-admin',
    role: 'org_admin',
    name: 'Organization Admin',
    number: 2,
    icon: Building2,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    borderColor: 'border-blue-200',
    cardBg: 'bg-blue-50',
    activeBg: 'bg-blue-50',
    scope: 'Organization-wide',

    description:
      'The owner or IT lead for a single organization. Sets up the workspace and manages who has access.',

    capabilities: [
      'Edit organization name & logo',
      'Invite & remove members',
      'Promote or demote user roles',
      'Deactivate or reactivate users',
      'Create and manage all projects',
      'View organization-wide dashboards',
      'View audit logs',
      'Configure organization settings',
    ],

    restrictions: [
      'Cannot access other organizations',
      'Cannot modify platform-level settings',
      'Cannot remove the last Organization Admin',
    ],

    analogyTitle: 'Real-World Analogy',

    analogyDescription:
      "A company's IT Administrator — full control inside their building, but no keys to other buildings.",
  },

  {
    id: 'project-manager',
    role: 'project_manager',
    name: 'Project Manager',
    number: 3,
    icon: BriefcaseBusiness,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    borderColor: 'border-orange-200',
    cardBg: 'bg-orange-50',
    activeBg: 'bg-orange-50',
    scope: 'Assigned projects only',

    description:
      'Leads one or more projects within the organization. Responsible for delivery, sprint planning, and team coordination.',

    capabilities: [
      'Create projects (if org policy allows)',
      'Create / Edit / Delete parent & child tasks',
      'Assign and reassign tasks to members',
      'Manage sprint lifecycle & backlog',
      'Manage labels',
      'View project analytics & export reports',
      'Add/remove org members from their projects',
    ],

    restrictions: [
      'Cannot invite new users into the organization',
      'Cannot access projects they are not assigned to',
      'Cannot manage organization settings',
      'Cannot change organization-wide user roles',
    ],

    analogyTitle: 'Real-World Analogy',

    analogyDescription:
      'A construction site foreman — authority over their site, but cannot hire from outside the company.',
  },

  {
    id: 'developer',
    role: 'developer',
    name: 'Developer',
    number: 8,
    icon: Code2,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    borderColor: 'border-green-200',
    cardBg: 'bg-green-50',
    activeBg: 'bg-green-50',
    scope: 'Assigned projects',

    description:
      'An individual contributor. Works on tasks, logs time, and collaborates with teammates.',

    capabilities: [
      'Create new tasks',
      'Update their own assigned tasks',
      'Change task status per workflow',
      'Log work hours & update story points',
      'Add comments & mention teammates',
      'Upload attachments',
      'View project dashboards relevant to their work',
    ],

    restrictions: [
      'Cannot assign tasks to other users',
      'Cannot edit or delete tasks owned by others',
      'Cannot manage sprints or labels',
      'Cannot delete projects',
      'Cannot change workflow configuration',
    ],

    analogyTitle: 'Real-World Analogy',

    analogyDescription:
      "A staff engineer — executes the plan, raises blockers, but doesn't control the roadmap.",
  },

  {
    id: 'viewer',
    role: 'viewer',
    name: 'Viewer',
    number: 4,
    icon: Eye,
    iconColor: 'text-slate-500',
    iconBg: 'bg-slate-100',
    borderColor: 'border-slate-200',
    cardBg: 'bg-slate-50',
    activeBg: 'bg-slate-50',
    scope: 'Read-only on assigned projects',

    description:
      'A stakeholder, client, or external auditor who needs visibility without the ability to make changes.',

    capabilities: [
      'View boards, backlogs, and sprints',
      'View reports and dashboards',
      'View all tasks within assigned projects',
      'Comment on tasks (if project allows)',
    ],

    restrictions: [
      'Cannot create, edit, or delete tasks',
      'Cannot assign tasks',
      'Cannot upload attachments',
      'Cannot manage projects or sprints',
      'Cannot change any settings',
    ],

    analogyTitle: 'Real-World Analogy',

    analogyDescription:
      'A board member reviewing a live dashboard — full visibility, zero edit access.',
  },

  {
    id: 'member',
    role: 'member',
    name: 'Member',
    number: 5,
    icon: BriefcaseBusiness,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    borderColor: 'border-blue-200',
    cardBg: 'bg-blue-50',
    activeBg: 'bg-blue-50',
    scope: 'Organization-wide',

    description:
      'A team member who contributes to the organization by working on assigned projects and tasks.',

    capabilities: [
      'View assigned projects and tasks',
      'Create and update tasks',
      'Update task status',
      'Add comments and mention teammates',
      'Upload attachments',
      'Log work hours',
      'View relevant project dashboards',
    ],

    restrictions: [
      'Cannot manage organization settings',
      'Cannot invite or remove organization members',
      'Cannot change user roles',
      'Cannot manage all projects',
      'Cannot manage organization-wide settings',
    ],

    analogyTitle: 'Real-World Analogy',

    analogyDescription:
      'A regular team member who contributes to projects and completes assigned work without administrative control.',
  },
];

export const auditLogs = [
  {
    id: 1,
    type: 'success',
    icon: CheckCircle2,
    text: 'Sarah Chen promoted Alex Kim from Developer to Project Manager',
    time: '2 hours ago',
  },

  {
    id: 2,
    type: 'add',
    icon: UserPlus,
    text: 'Marcus Johnson invited Jordan Williams to Developer',
    time: '1 day ago',
  },

  {
    id: 3,
    type: 'warning',
    icon: UserMinus,
    text: 'Sarah Chen demoted Priya Patel from Project Manager to Developer',
    time: '3 days ago',
  },

  {
    id: 4,
    type: 'error',
    icon: XCircle,
    text: 'Sarah Chen removed Chris Lee from Viewer',
    time: '5 days ago',
  },

  {
    id: 5,
    type: 'add',
    icon: Plus,
    text: 'Marcus Johnson invited Maya Gupta to Viewer',
    time: '1 week ago',
  },
];
