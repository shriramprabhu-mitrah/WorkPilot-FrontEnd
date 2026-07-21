import { colors } from "@/src/styles/colors";
export const Projects = [
  {
    initials: "ATL",
    name: "Atlas Platform",
    code: "ATL-*",
    status: "Active",
    description:
      "Core platform infrastructure and API redesign for improved performance and scalability.",
    progress: 68,
    tasks: "1/6",
    date: "Aug 15",
    members: [
      { name: "S", color: colors.avatarBlue },
      { name: "M", color: colors.avatarGreen },
      { name: "P", color: colors.avatarIndigo },
      { name: "J", color: colors.avatarPink },
    ],
  },
  {
    initials: "MOB",
    name: "Mobile Revamp",
    code: "MOB-*",
    status: "Active",
    description:
      "Complete redesign of iOS and Android mobile applications with new user experience flows.",
    progress: 42,
    tasks: "0/4",
    date: "Sep 30",
    members: [
      { name: "S", color: colors.avatarBlue },
      { name: "P", color: colors.avatarPink },
      { name: "A", color: colors.avatarGreen },
    ],
  },
  {
    initials: "DAT",
    name: "Data Pipeline",
    code: "DAT-*",
    status: "Active",
    description:
      "ETL pipeline for real-time analytics processing and executive reporting dashboards.",
    progress: 85,
    tasks: "1/3",
    date: "Jul 20",
    members: [
      { name: "M", color: colors.avatarBlue },
      { name: "J", color: colors.avatarIndigo }
    ],
  },
  {
    initials: "DS",
    name: "Design System",
    code: "DS-*",
    status: "Planning",
    description:
      "Unified component library and design tokens to maintain consistency across all products.",
    progress: 30,
    tasks: "1/3",
    date: "Nov 1",
    members: [
      { name: "P", color: colors.avatarPink },
      { name: "A", color: colors.avatarIndigo }
    ],
  },
  {
    initials: "CTP",
    name: "Customer Portal",
    code: "CTP-*",
    status: "Planning",
    description:
      "Self-service portal with billing, account management and support ticket integration.",
    progress: 15,
    tasks: "1/3",
    date: "Dec 15",
    members: [
      { name: "S", color: colors.avatarIndigo },
      { name: "M", color: colors.avatarBlue },
      { name: "P", color: colors.avatarGreen },
      { name: "A", color: colors.avatarPink }
    ]
  }
];
