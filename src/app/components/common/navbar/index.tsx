'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, Settings, ChevronRight, Menu } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { useAppSelector } from '@/src/store';
import { getInitials } from '../format';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split('/').filter(Boolean);
  const title = segments[0] ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1) : 'Home';
  const user = useAppSelector((state) => state.user);

  return (
    <header
      className="flex items-center justify-between h-[56px] px-3 md:px-5 border-b shrink-0"
      style={{ backgroundColor: colors.navbarBg, borderColor: colors.navbarBorder }}
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

        {/* Avatar */}
        <Link
          href="/profile"
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
          <ChevronRight size={13} className="text-gray-400 rotate-90 hidden md:inline" />
        </Link>
      </div>
    </header>
  );
};
