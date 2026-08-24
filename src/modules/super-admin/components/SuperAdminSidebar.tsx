'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/src/store';
import { useSignin } from '@/src/modules/signin/hooks/useSignin';
import { LayoutDashboard, Building2, FolderKanban, Users, Settings, LogOut, X } from 'lucide-react';
import { TrackrLogoSvg } from '@/src/assets/svgs';
import { getInitials } from '@/src/app/components/common/format';

const navItems = [
  { label: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
  { label: 'Organizations', path: '/super-admin/organizations', icon: Building2 },
  { label: 'Projects', path: '/super-admin/projects', icon: FolderKanban },
  { label: 'Members', path: '/super-admin/members', icon: Users },
  // { label: 'Settings', path: '/super-admin/settings', icon: Settings },
];

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SuperAdminSidebar = ({ isOpen = true, onClose }: SuperAdminSidebarProps) => {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user);
  const { handleLogOut } = useSignin();

  return (
    <>
      {/* Mobile overlay */}
      {onClose && isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static
          inset-y-0 left-0
          z-50
          flex flex-col
          w-[240px]
          h-screen
          bg-gradient-to-b from-[#1a1625] to-[#0f0a1a]
          border-r border-purple-900/20
          transform transition-transform duration-300 ease-in-out
          ${onClose ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          lg:translate-x-0
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-purple-900/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <TrackrLogoSvg />
            </div>
            <div>
              <h1 className="text-white font-bold text-base">Trackr</h1>
              <p className="text-purple-300 text-[10px] font-medium tracking-wide uppercase">
                Super Admin
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-purple-900/30 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} className="text-purple-300" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = pathname === path || pathname.startsWith(`${path}/`);
            return (
              <Link
                key={path}
                href={path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                      : 'text-purple-200 hover:bg-purple-900/30 hover:text-white'
                  }
                `}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-purple-900/30 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {getInitials(user.name || 'Super Admin')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {user.name || 'Super Admin'}
              </p>
              <p className="text-purple-300 text-xs truncate">{user.email || 'admin@trackr.com'}</p>
            </div>
          </div>
          <button
            onClick={() => handleLogOut()}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-200 hover:text-white text-sm font-medium transition-all duration-200"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
