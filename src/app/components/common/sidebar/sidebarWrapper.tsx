'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, X, LucideIcon } from 'lucide-react';
import { useAppSelector } from '@/src/store';
import { colors } from '@/src/styles/colors';
import { getInitials } from '../format';

export interface SidebarNavItem {
  label: string;
  path: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarWrapperProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  showLabels: boolean;
  navItems: SidebarNavItem[];
  pathname: string;
  orgSlug: string;
  hasProject: boolean;
  projectName?: string;
  projectLabel: string;
  sprintLabel: string;
  onOpenManageProject: () => void;
}

const getProjectInitials = (name?: string) => {
  if (!name) return 'W';
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

export const SidebarWrapper = ({
  isOpen = true,
  onClose,
  isExpanded,
  onExpandChange,
  showLabels,
  navItems,
  pathname,
  orgSlug,
  hasProject,
  projectName,
  projectLabel,
  sprintLabel,
  onOpenManageProject,
}: SidebarWrapperProps) => {
  const user = useAppSelector((state) => state.user);
  const organization = useAppSelector((state) => state.organization);
  const [logoLoadError, setLogoLoadError] = useState<string | null>(null);

  return (
    <>
      {/* Mobile overlay */}
      {onClose && isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 xl:hidden" onClick={onClose} />
      )}

      {/* Sidebar wrapper */}
      <div
        onMouseEnter={() => onExpandChange(true)}
        onMouseLeave={() => onExpandChange(false)}
        className={`
          ${
            onClose
              ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out xl:static xl:translate-x-0 ${
                  isOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'relative'
          }
          h-screen
          overflow-y-auto
          overflow-x-hidden
        `}
      >
        <aside
          className={`
            flex
            flex-col
            min-h-screen
            bg-white dark:bg-slate-900
            border-r border-gray-200 dark:border-slate-700
            shrink-0
            transition-all
            duration-300
            ${isExpanded || (onClose && isOpen) ? 'w-[220px]' : 'w-[72px]'}
          `}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              {organization?.logo_url && logoLoadError !== organization.logo_url ? (
                <Image
                  src={organization.logo_url}
                  alt={`${organization?.name || 'Organization'} logo`}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  onError={() => {
                    if (organization.logo_url) {
                      setLogoLoadError(organization.logo_url);
                    }
                  }}
                />
              ) : (
                <div
                  className="w-full h-full rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  {getProjectInitials(organization?.name)}
                </div>
              )}
            </div>
            {showLabels && (
              <span
                title={organization?.name || 'WorkPilot'}
                className="overflow-hidden whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-white"
              >
                {organization?.name || 'WorkPilot'}
              </span>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="ml-auto xl:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                aria-label="Close sidebar"
              >
                <X size={20} className="text-gray-500 dark:text-slate-300" />
              </button>
            )}
          </div>

          {/* Project selector */}
          <div className="px-3 py-3">
            <div
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors bg-[#f4f5f7] dark:bg-slate-800
                ${
                  !hasProject
                    ? 'border border-red-500'
                    : 'border border-transparent hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              onClick={onOpenManageProject}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: colors.accent }}
                >
                  {getProjectInitials(projectName)}
                </div>
                {showLabels && (
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-gray-700 dark:text-slate-200 truncate max-w-[120px]">
                      {projectLabel}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-slate-200 truncate max-w-[120px]">
                      {sprintLabel}
                    </div>
                  </div>
                )}
              </div>
              {showLabels && (
                <ChevronDown size={13} className="text-gray-400 dark:text-slate-400 shrink-0" />
              )}
            </div>
          </div>

          {/* Menu label */}
          <p
            className={`px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 transition-opacity duration-300 ${showLabels ? 'opacity-100' : 'opacity-0'}`}
          >
            Menu
          </p>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active =
                pathname === href ||
                pathname.startsWith(`${href}/`) ||
                (label === 'Dashboard' && pathname.includes('/dashboard')) ||
                (label === 'Boards' && pathname.includes('/boards')) ||
                (label === 'Backlog' && pathname.includes('/backlog')) ||
                (label === 'Calendar' && pathname.includes('/calendar')) ||
                (label === 'Teams' && pathname.includes('/teams'));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-colors min-w-0
                    ${
                      active
                        ? 'bg-[#eff6ff] dark:bg-blue-900/40 text-[#155dfc] dark:text-blue-300'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <div className="w-6 flex items-center justify-center shrink-0">
                    <Icon
                      size={15}
                      className={
                        active
                          ? 'text-[#155dfc] dark:text-blue-300'
                          : 'text-gray-500 dark:text-slate-400'
                      }
                    />
                  </div>
                  <span
                    className={`ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${showLabels ? 'max-w-[140px] opacity-100' : 'max-w-0 opacity-0'}`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="mx-3 border-t border-gray-100 dark:border-slate-700" />

          {/* User */}
          <div
            className={`flex items-center py-3.5 ${showLabels ? 'gap-2.5 px-4' : 'justify-center px-0'}`}
          >
            <Link
              href={`/${orgSlug}/profile`}
              className={`
                flex items-center gap-2.5 min-w-0 group cursor-pointer
                ${showLabels ? 'flex-1' : 'justify-center w-full'}
              `}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 group-hover:opacity-90 transition-opacity"
                style={{ backgroundColor: user.color ?? '' }}
              >
                {getInitials(user.name)}
              </div>
              {showLabels && (
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 dark:text-white truncate">
                    {user.name || 'User Name'}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-100 truncate">
                    {user.email || 'user@email.com'}
                  </p>
                </div>
              )}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
};
