"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeTokens } from "@/src/lib/utils/cookies";
import {
  LayoutDashboard,
  FolderKanban,
  CircleDot,
  Users,
  Settings,
  Bell,
  Calendar,
  BarChart2,
  ChevronDown,
  Plus,
  Search,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Issues", href: "/issues", icon: CircleDot },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Members", href: "/members", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
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
        <div className="w-8 h-8 bg-[#155DFC] rounded-lg flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
            <path
              d="M2 17L12 22L22 17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-bold text-[15px] text-gray-900">Trackr</span>
      </div>

      {/* Workspace selector */}
      <div className="px-3 py-3">
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-[#F4F5F7] cursor-pointer hover:bg-gray-200 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#4F39F6] flex items-center justify-center text-[10px] font-bold text-white">
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
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[#EFF6FF] text-[#155DFC]"
                  : "text-[#99A1AF] hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <Icon
                size={15}
                className={active ? "text-[#155DFC]" : "text-[#99A1AF]"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* New Project */}
      <div className="px-3 py-2">
        <button className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium text-[#99A1AF] hover:bg-gray-100 hover:text-gray-700 transition-colors border border-dashed border-gray-200">
          <Plus size={14} />
          New Project
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-gray-100" />

      {/* User */}
      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <div className="w-7 h-7 rounded-full bg-[#4F39F6] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
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
