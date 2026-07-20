import { colors } from "@/src/styles/colors";
import { Member, RoleCard } from "@/src/types/teams";

export const MEMBERS: Member[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Project Manager",
    initials: "SC",
    avatarColor: "#7c3aed",
    tasks: 0,
    done: 0,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    role: "Senior Developer",
    initials: "MJ",
    avatarColor: "#2563eb",
    tasks: 8,
    done: 3,
  },
  {
    id: "3",
    name: "Priya Patel",
    role: "Frontend Developer",
    initials: "PP",
    avatarColor: "#db2777",
    tasks: 5,
    done: 0,
  },
  {
    id: "4",
    name: "Alex Kim",
    role: "UI/UX Designer",
    initials: "AK",
    avatarColor: "#059669",
    tasks: 4,
    done: 1,
  },
  {
    id: "5",
    name: "Jordan Williams",
    role: "QA Engineer",
    initials: "JW",
    avatarColor: "#d97706",
    tasks: 2,
    done: 0,
  },
];

export const ROLES: RoleCard[] = [
  {
    name: "Organization Admin",
    description: "Full access to all settings and resources.",
    dotColor: colors.error,
    permissions: [
      "Create Organization",
      "Invite Members",
      "Create Projects",
      "Manage Users",
      "Configure Roles",
      "Manage Settings",
    ],
  },
  {
    name: "Project Manager",
    description: "Manage projects, sprints, and team assignments.",
    dotColor: colors.primary,
    permissions: [
      "Create Parent Tasks",
      "Assign Tasks",
      "Manage Sprint",
      "Manage Backlog",
      "Generate Reports",
      "Edit Project",
    ],
  },
  {
    name: "Team Member",
    description: "Contribute to tasks and collaborate with the team.",
    dotColor: colors.colActive,
    permissions: [
      "View Tasks",
      "Update Status",
      "Comment",
      "Upload Attachments",
      "Log Work Hours",
    ],
  },
];
