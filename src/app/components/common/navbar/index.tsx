'use client';

import { usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  Settings,
  ChevronRight,
  ChevronDown,
  Menu,
  User,
  Lock,
  LogOut,
} from 'lucide-react';
import { colors } from '@/src/styles/colors';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { ThemeToggle } from '@/src/app/components/common/theme-toggle';
import { useAppSelector } from '@/src/store';
import { getInitials } from '../format';
import { removeTokens } from '@/src/lib/utils/cookies';
import { setIsLoggingOut } from '@/src/lib/config/axios-client';
import { useSignin } from '@/src/modules/signin/hooks/useSignin';
import { useEffect, useRef, useState } from 'react';
import { useOrgNavigation } from '@/src/hooks/useOrgNavigation';
import { usePermissions } from '@/src/hooks/usePermissions';

import { GlobalSearchModal } from '@/src/app/components/common/global-search';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const pathname = usePathname();
  const { push } = useOrgNavigation();
  const { isOrgAdmin } = usePermissions();
  const segments = pathname.split('/').filter(Boolean);
  const title = segments[1] ? segments[1].charAt(0).toUpperCase() + segments[1].slice(1) : 'Home';
  const user = useAppSelector((state) => state.user);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { handleLogOutAsync, logOut } = useSignin();

  const handleLogoutClick = async () => {
    if (logOut.isLoading) return;
    setShowProfileMenu(false);
    setIsLoggingOut(true);
    try {
      await handleLogOutAsync();
      removeTokens();
    } catch {
      removeTokens();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <header className="flex items-center justify-between h-[56px] px-3 md:px-5 border-b shrink-0 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
        {/* Left side - Hamburger + Breadcrumb */}
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          {/* Hamburger menu for mobile */}
          {onMenuClick && (
            <WpButton
              variant="ghost"
              size="sm"
              className="lg:hidden !p-1.5 text-gray-500 dark:text-gray-400"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </WpButton>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[13px] shrink-0">
            <span className="text-gray-500 dark:text-slate-400 font-medium hidden sm:inline">
              Organization
            </span>
            <ChevronRight
              size={13}
              className="text-gray-400 dark:text-slate-500 hidden sm:inline"
            />
            <span className="text-gray-800 dark:text-white font-semibold">{title}</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center justify-between sm:w-48 md:w-64 lg:w-80 h-8 px-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 hover:bg-gray-200/70 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-gray-500 dark:text-slate-400 text-xs transition-colors cursor-pointer text-left"
            aria-label="Search tasks, projects, stories..."
          >
            <div className="flex items-center gap-2 truncate">
              <Search size={13} className="text-gray-400 dark:text-slate-100 shrink-0" />
              <span className="truncate dark:text-slate-100">Search tasks, projects...</span>
            </div>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:text-slate-400 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded shadow-xs">
              ⌘K
            </kbd>
          </button>

          {/* Mobile search button */}
          <WpButton
            variant="ghost"
            size="sm"
            className="sm:hidden !p-1.5 text-gray-500 dark:text-slate-300"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={17} />
          </WpButton>

          {/* Notifications */}
          <WpButton
            variant="ghost"
            size="sm"
            className="relative !p-1.5 text-gray-500 dark:text-slate-300"
          >
            <Bell size={17} />
            <span
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: colors.error }}
            />
          </WpButton>

          {/* Theme toggle */}
          <ThemeToggle />

          {isOrgAdmin && (
            <WpButton
              variant="ghost"
              size="sm"
              className="!p-1.5 text-gray-500 dark:text-slate-300 hidden md:flex"
              onClick={() => push('/settings')}
              aria-label="Settings"
            >
              <Settings size={17} />
            </WpButton>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-gray-300 dark:bg-slate-600 hidden md:block" />

          {/* Profile Dropdown */}
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ backgroundColor: user.color || '' }}
              >
                {getInitials(user.name)}
              </div>

              <span className="text-[13px] font-medium text-gray-700 dark:text-white hidden md:inline">
                {user.name || 'User Name'}
              </span>

              <ChevronDown
                size={13}
                className={`text-gray-400 dark:text-slate-400 hidden md:inline transition-transform ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50 overflow-hidden">
                {/* My Account */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    push('/profile');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <User size={16} className="text-gray-500 dark:text-slate-400" />
                  <span>My Account</span>
                </button>

                {/* Change Password */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    push('/profile?changePassword=true');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <Lock size={16} className="text-gray-500 dark:text-slate-400" />
                  <span>Change Password</span>
                </button>

                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-slate-700" />

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  disabled={logOut.isLoading}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
