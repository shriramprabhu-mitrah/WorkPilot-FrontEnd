"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Settings, ChevronRight } from "lucide-react";
import { colors } from "@/src/styles/colors";
import { WpButton } from "@/src/app/components/common/button";
import { WpInput } from "@/src/app/components/common/input";

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
        <WpInput
            type="text"
            placeholder="Search tasks, projects..."
            icon={<Search size={13} />}
            wrapperClassName="w-80"
            className="bg-white/70 text-[12px] !h-8"
          />
      </div>
      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <WpButton variant="ghost" size="sm" className="relative !p-1.5 text-gray-500">
          <Bell size={17} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.error }} />
        </WpButton>
        <WpButton variant="ghost" size="sm" className="!p-1.5 text-gray-500">
          <Settings size={17} />
        </WpButton>

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
