'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  X,
} from 'lucide-react';
import { TrackrLogoSvg } from '@/src/assets/svgs';
import { colors } from '@/src/styles/colors';
import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';
import { getInitials } from '../format';
import { useEffect, useState } from 'react';

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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user);
  const organization = useAppSelector((state) => state.organization);
  const { handleLogOut } = useSignin();
  const [isExpanded, setIsExpanded] = useState(false);
  const handleLogoutClick = () => {
    removeTokens();
    handleLogOut();
  };

  // Get organization name initials
  const getOrgInitials = (orgName?: string) => {
    if (!orgName) return 'W';
    return orgName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen && onClose) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {onClose && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${onClose ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
          lg:translate-x-0
         h-screen overflow-y-auto overflow-x-hidden
        `}
      >
        <aside
          className={`flex flex-col min-h-screen bg-white border-r border-gray-200 shrink-0 transition-all duration-300 ${
            isExpanded ? 'w-[220px]' : 'w-[72px]'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: colors.primary }}
            >
              <TrackrLogoSvg />
            </div>
            {isExpanded && (
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                }`}
              >
                WorkPilot
              </span>
            )}
            {/* Close button for mobile */}
            {onClose && (
              <button
                onClick={onClose}
                className="ml-auto lg:hidden p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close sidebar"
              >
                <X size={20} className="text-gray-500" />
              </button>
            )}
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
                  {getOrgInitials(organization?.name)}
                </div>
                {isExpanded && (
                  <span
                    className={`text-[13px] font-medium text-gray-700 overflow-hidden whitespace-nowrap text-ellipsis transition-all duration-300 ${
                      isExpanded ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                  >
                    {organization?.name || 'My Workspace'}
                  </span>
                )}
              </div>
              {isExpanded && <ChevronDown size={13} className="text-gray-400" />}
            </div>
          </div>

          {/* Search */}
          <div className="px-3 pb-2 h-10 flex items-center">
            {isExpanded && (
              <WpInput
                type="text"
                placeholder="Search..."
                icon={<Search size={13} />}
                className="bg-gray-100 border-1 text-[12px] !h-8"
              />
            )}
          </div>

          {/* Nav label */}
          <p
            className={`px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider transition-opacity duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Menu
          </p>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
                  style={{
                    backgroundColor: active ? colors.primaryLight : undefined,
                    color: active ? colors.primary : colors.gray700,
                  }}
                >
                  {/* Fixed icon container */}
                  <div className="w-6 flex items-center justify-center shrink-0">
                    <Icon
                      size={15}
                      style={{
                        color: active ? colors.primary : colors.gray700,
                      }}
                    />
                  </div>

                  {/* Animated label */}
                  <span
                    className={`ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${
                      isExpanded ? 'max-w-[140px] opacity-100' : 'max-w-0 opacity-0'
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="mx-3 border-t border-gray-100" />

          {/* User */}
          {/* User */}
          <div
            className={`flex items-center ${
              isExpanded ? 'gap-2.5 px-4' : 'justify-center px-0'
            } py-3.5`}
          >
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
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">
                    {user.name || 'User Name'}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {user.email || 'user@email.com'}
                  </p>
                </div>
              )}
            </Link>
            {isExpanded && (
              <WpButton
                variant="ghost"
                size="sm"
                onClick={handleLogoutClick}
                className="!p-1.5 text-gray-400 hover:bg-red-50 hover:!text-red-500"
                title="Logout"
              >
                <LogOut size={15} />
              </WpButton>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};
