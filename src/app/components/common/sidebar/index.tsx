"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeTokens } from "@/src/lib/utils/cookies";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Settings,
  Calendar,
  BarChart2,
  ChevronDown,
  Plus,
  Search,
  LogOut,
  Flag,
  SquareKanban,
  User,
  KanbanSquareDashedIcon,
} from "lucide-react";
import { TrackrLogoSmSvg } from "@/src/assets/svgs";
import { colors } from "@/src/styles/colors";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Boards", href: "/boards", icon: KanbanSquareDashedIcon },
  { label: "Backlog", href: "/backlog", icon: BarChart2 },
  { label: "Sprint", href: "/sprint", icon: SquareKanban },
  { label: "Tasks", href: "/tasks", icon: ClipboardList },
  { label: "Reports", href: "/reports", icon: Flag },
  { label: "Teams", href: "/teams", icon: User },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeTokens();
    router.push("/signin");
  };

  return (
    <aside className="flex flex-col w-[220px] min-h-screen bg-white border-r border-gray-200 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: colors.primary }}
        >
          <TrackrLogoSmSvg />
        </div>
        <span className="font-bold text-[15px] text-gray-900">WorkPilot</span>
      </div>

      {/* Workspace selector */}
      <div className="px-3 py-3">
        <div
          className="flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
          style={{ backgroundColor: colors.workspaceBg }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: colors.accent }}
            >
              W
            </div>
            <span className="text-[13px] font-medium text-gray-700">
              My Workspace
            </span>
          </div>
          <ChevronDown size={13} className="text-gray-400" />
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2.5 py-1.5">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[12px] text-gray-500 placeholder-gray-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Nav label */}
      <p className="px-4 pt-2 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
        Menu
      </p>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors"
              style={{
                backgroundColor: active ? colors.primaryLight : undefined,
                color: active ? colors.primary : colors.gray700,
              }}
            >
              <Icon
                size={15}
                style={{ color: active ? colors.primary : colors.gray700 }}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* New Project */}
      <div className="px-3 py-2">
        <button
          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium hover:bg-gray-100 hover:text-gray-700 transition-colors border border-dashed border-gray-200"
          style={{ color: colors.gray400 }}
        >
          <Plus size={14} />
          New Project
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-gray-100" />

      {/* User */}
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
          style={{ backgroundColor: colors.accent }}
        >
          U
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-gray-800 truncate">
            User Name
          </p>
          <p className="text-[11px] text-gray-400 truncate">user@email.com</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
};
