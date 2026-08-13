'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { useAppSelector } from '@/src/store';
import { getInitials } from '../format';
import { removeTokens } from '@/src/lib/utils/cookies';
import { useSignin } from '@/src/modules/signin/hooks/useSignin';
import { useEffect, useRef, useState } from 'react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split('/').filter(Boolean);
  const title = segments[0] ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1) : 'Home';
  const user = useAppSelector((state) => state.user);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
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

    removeTokens();
    setShowProfileMenu(false);

    try {
      await handleLogOutAsync();
    } catch {
      // onError in useSignin handles redirect
    }
  };
  return (
    <header
      className="flex items-center justify-between h-[56px] px-3 md:px-5 border-b shrink-0"
      style={{ backgroundColor: colors.white, borderColor: colors.navbarBorder }}
    >
      {/* Left side - Hamburger + Breadcrumb + Search */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        {/* Hamburger menu for mobile */}
        {onMenuClick && (
          <WpButton
            variant="ghost"
            size="sm"
            className="lg:hidden !p-1.5 text-gray-500"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </WpButton>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] shrink-0">
          <span className="text-gray-500 font-medium hidden sm:inline">Organization</span>
          <ChevronRight size={13} className="text-gray-400 hidden sm:inline" />
          <span className="text-gray-800 font-semibold">{title}</span>
        </div>

        {/* Search - hidden on small mobile */}
        <WpInput
          type="text"
          placeholder="Search tasks, projects..."
          icon={<Search size={13} />}
          wrapperClassName="hidden sm:block sm:w-48 md:w-64 lg:w-80"
          className="bg-white/70 text-[12px] !h-8"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Mobile search button */}
        <WpButton
          variant="ghost"
          size="sm"
          className="sm:hidden !p-1.5 text-gray-500"
          aria-label="Search"
        >
          <Search size={17} />
        </WpButton>

        {/* Notifications */}
        <WpButton variant="ghost" size="sm" className="relative !p-1.5 text-gray-500">
          <Bell size={17} />
          <span
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: colors.error }}
          />
        </WpButton>

        <WpButton
          variant="ghost"
          size="sm"
          className="!p-1.5 text-gray-500 hidden md:flex"
          onClick={() => router.push('/settings')}
        >
          <Settings size={17} />
        </WpButton>

        {/* Divider - hidden on mobile */}
        <div className="w-px h-5 bg-gray-300 hidden md:block" />

        {/* Profile Dropdown */}
        <div ref={profileMenuRef} className="relative">
          {/* Profile button */}
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{ backgroundColor: colors.accent }}
            >
              {getInitials(user.name)}
            </div>

            <span className="text-[13px] font-medium text-gray-700 hidden md:inline">
              {user.name || 'User Name'}
            </span>

            <ChevronDown
              size={13}
              className={`text-gray-400 hidden md:inline transition-transform ${
                showProfileMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown */}
          {showProfileMenu && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-2
                w-52
                rounded-lg
                border
                border-gray-200
                bg-white
                shadow-lg
                z-50
                overflow-hidden
              "
            >
              {/* My Account */}
              <Link
                href="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-2.5
                  text-[13px]
                  text-gray-700
                  hover:bg-gray-50
                  transition-colors
                "
              >
                <User size={16} className="text-gray-500" />
                <span>My Account</span>
              </Link>

              {/* Change Password */}
              <Link
                href="/profile?changePassword=true"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
              >
                <Lock size={16} className="text-gray-500" />
                <span>Change Password</span>
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogoutClick}
                disabled={logOut.isLoading}
                className="
                  flex
                  items-center
                  gap-3
                  w-full
                  px-4
                  py-2.5
                  text-[13px]
                   font-semibold
                  text-red-600
                  hover:bg-red-50
                  transition-colors
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
