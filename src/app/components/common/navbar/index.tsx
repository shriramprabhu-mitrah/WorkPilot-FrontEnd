"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Settings, ChevronRight } from "lucide-react";
import { colors } from "@/src/styles/colors";

export const Navbar = () => {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean).pop() ?? "home";
  const title = segment.charAt(0).toUpperCase() + segment.slice(1);
  return (
    <header
      className="flex items-center justify-between h-[56px] px-5 border-b shrink-0"
      style={{ backgroundColor: colors.navbarBg, borderColor: colors.navbarBorder }}
    >
      {/* Breadcrumb + Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[13px] w-48 shrink-0">
          <span className="text-gray-500 font-medium">Workspace</span>
          <ChevronRight size={13} className="text-gray-400" />
          <span className="text-gray-800 font-semibold">{title}</span>
        </div>
        <div className="flex items-center bg-white/70 border border-gray-300 rounded-lg px-3 py-1.5 w-80">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="bg-transparent text-[12px] text-gray-600 placeholder-gray-400 outline-none w-full"
          />
        </div>
      </div>
      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-1.5 rounded-lg hover:bg-white/50 transition-colors text-gray-500">
          <Bell size={17} />
          <span
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: colors.error }}
          />
        </button>

        {/* Settings */}
        <button className="p-1.5 rounded-lg hover:bg-white/50 transition-colors text-gray-500">
          <Settings size={17} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-300" />

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ backgroundColor: colors.accent }}
          >
            U
          </div>
          <span className="text-[13px] font-medium text-gray-700">
            User Name
          </span>
          <ChevronRight size={13} className="text-gray-400 rotate-90" />
        </div>
      </div>
    </header>
  );
};
