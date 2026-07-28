'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeTokens } from '@/src/lib/utils/cookies';
import { useAppSelector } from '@/src/store';
import { useSignin } from '@/src/modules/signin/hooks/useSignin';
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
} from 'lucide-react';
import { TrackrLogoSvg } from '@/src/assets/svgs';
import { colors } from '@/src/styles/colors';
import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';
import { getInitials } from '../format';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Boards', href: '/boards', icon: KanbanSquareDashedIcon },
  { label: 'Backlog', href: '/backlog', icon: BarChart2 },
  { label: 'Sprint', href: '/sprint', icon: SquareKanban },
  { label: 'Tasks', href: '/tasks', icon: ClipboardList },
  { label: 'Reports', href: '/reports', icon: Flag },
  { label: 'Teams', href: '/teams', icon: User },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'My Profile', href: '/profile', icon: User },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { handleLogOut } = useSignin();

  const handleLogoutClick = () => {
    removeTokens();
    handleLogOut();
  };

  return (
    <div className="h-screen overflow-auto">
      <aside className="flex flex-col w-[220px] min-h-screen bg-white border-r border-gray-200 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: colors.primary }}
          >
            <TrackrLogoSvg />
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
              <span className="text-[13px] font-medium text-gray-700">My Workspace</span>
            </div>
            <ChevronDown size={13} className="text-gray-400" />
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <WpInput
            type="text"
            placeholder="Search..."
            icon={<Search size={13} />}
            className="bg-gray-100 border-1 text-[12px] !h-8"
          />
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
                <Icon size={15} style={{ color: active ? colors.primary : colors.gray700 }} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* New Project */}
        <div className="px-3 py-2">
          <WpButton
            variant="secondary"
            size="sm"
            fullWidth
            leftIcon={<Plus size={14} />}
            className="border-dashed text-gray-400 justify-start"
          >
            New Project
          </WpButton>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-gray-100" />

        {/* User */}
        <div className="flex items-center gap-2.5 px-4 py-3.5">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 flex-1 min-w-0 group cursor-pointer"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 group-hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.accent }}
            >
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                {user.name || 'User Name'}
              </p>
              <p className="text-[11px] text-gray-400 truncate">{user.email || 'user@email.com'}</p>
            </div>
          </Link>
          <WpButton
            variant="ghost"
            size="sm"
            onClick={handleLogoutClick}
            className="!p-1.5 text-gray-400 hover:bg-red-50 hover:!text-red-500"
            title="Logout"
          >
            <LogOut size={15} />
          </WpButton>
        </div>
      </aside>
    </div>
  );
};
