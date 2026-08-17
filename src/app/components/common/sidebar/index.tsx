'use client';

import Link from 'next/link';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { removeTokens } from '@/src/lib/utils/cookies';
import { useAppSelector, useAppDispatch } from '@/src/store';
import { setSelectedProject, setSelectedSprint, setSprints } from '@/src/store/slices/project';
import { useSignin } from '@/src/modules/signin/hooks/useSignin';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Settings,
  Calendar,
  BarChart2,
  ChevronDown,
  LogOut,
  Flag,
  KanbanSquareDashedIcon,
  User,
  X,
  Check,
  Zap,
  Plus,
  Eye,
} from 'lucide-react';
import { TrackrLogoSvg } from '@/src/assets/svgs';
import { colors } from '@/src/styles/colors';
import { WpButton } from '@/src/app/components/common/button';
import { getInitials } from '../format';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Project, SprintDetail } from '@/src/types/project';
import { useGetProjectsWithSprints } from '@/src/modules/project/hooks/useProject';

const navItemsBase = [
  { label: 'Dashboard', path: 'dashboard', icon: LayoutDashboard },
  //   { label: 'Projects', path: 'projects', icon: FolderKanban },
  { label: 'Boards', path: 'boards', icon: KanbanSquareDashedIcon },
  { label: 'Backlog', path: 'backlog', icon: BarChart2 },
  { label: 'Tasks', path: 'tasks', icon: ClipboardList },
  { label: 'Reports', path: 'reports', icon: Flag },
  { label: 'Teams', path: 'teams', icon: User },
  { label: 'Calendar', path: 'calendar', icon: Calendar },
  { label: 'Settings', path: 'settings', icon: Settings },
  { label: 'My Profile', path: 'profile', icon: User },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orgSlug = params.orgSlug as string;

  const user = useAppSelector((state) => state.user);
  const isOrgAdmin = user.role === 'org_admin';
  const { selectedProject, selectedSprint, sprints } = useAppSelector((state) => state.project);
  const [isExpanded, setIsExpanded] = useState(false);
  const { handleLogOutAsync, logOut } = useSignin();

  // Build navigation items with organization slug
  const navItems = useMemo(() => {
    if (!orgSlug) return [];
    return navItemsBase.map((item) => ({
      ...item,
      href: `/${orgSlug}/${item.path}`,
    }));
  }, [orgSlug]);

  // Manage Project modal state
  const [showManageProject, setShowManageProject] = useState(false);
  const [tempProject, setTempProject] = useState<Project | null>(selectedProject);
  const [tempSprint, setTempSprint] = useState<SprintDetail | null>(selectedSprint);
  const modalRef = useRef<HTMLDivElement>(null);
  const prevTempProjectId = useRef<string | undefined>(undefined);

  const { projectsWithSprints, isLoadingProjectsWithSprints } = useGetProjectsWithSprints();

  // Derive sprints from projectsWithSprints based on tempProject
  const tempSprints = useMemo(() => {
    if (!tempProject?.id || isLoadingProjectsWithSprints) return [];
    const found = projectsWithSprints.find((p) => p.id === tempProject.id);
    return found?.sprints ?? [];
  }, [tempProject, projectsWithSprints, isLoadingProjectsWithSprints]);

  // Reset sprint when project changes
  useEffect(() => {
    if (!tempProject?.id) return;
    const projectChanged = prevTempProjectId.current !== tempProject.id;
    prevTempProjectId.current = tempProject.id;
    if (projectChanged) {
      setTempSprint(null);
    }
  }, [tempProject?.id]);

  const getProjectInitials = (name?: string) => {
    if (!name) return 'W';
    return name
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const openManageProject = () => {
    setTempProject(selectedProject);
    setTempSprint(selectedSprint);
    setShowManageProject(true);
  };

  const handleApply = () => {
    if (tempProject) {
      dispatch(setSelectedProject(tempProject as Parameters<typeof setSelectedProject>[0]));
      dispatch(setSprints(tempSprints));
      dispatch(setSelectedSprint(tempSprint));
    }
    setShowManageProject(false);
  };

  const showLabels = isExpanded || !!onClose;

  const sprintLabel = selectedSprint ? selectedSprint.name : 'All sprints';
  const projectLabel = selectedProject?.name || 'Select Project';

  return (
    <>
      {/* Mobile overlay */}
      {onClose && isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 xl:hidden" onClick={onClose} />
      )}

      {/* Sidebar wrapper */}
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`
          fixed xl:static
          inset-y-0 left-0
          z-50
          h-screen
          overflow-y-auto
          overflow-x-hidden
          transform
          transition-transform
          duration-300
          ease-in-out
          ${onClose ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          xl:translate-x-0
        `}
      >
        <aside
          className={`
          flex
          flex-col
          min-h-screen
          bg-white
          border-r
          border-gray-200
          shrink-0
          transition-all
          duration-300
          ${isExpanded || (onClose && isOpen) ? 'w-[220px]' : 'w-[72px]'}
        `}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: colors.primary }}
            >
              <TrackrLogoSvg />
            </div>
            {showLabels && (
              <span className="overflow-hidden whitespace-nowrap text-sm font-semibold text-gray-800">
                WorkPilot
              </span>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="ml-auto xl:hidden p-1 rounded hover:bg-gray-100"
                aria-label="Close sidebar"
              >
                <X size={20} className="text-gray-500" />
              </button>
            )}
          </div>

          {/* Project selector */}
          <div className="px-3 py-3">
            <div
              className="flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              style={{ backgroundColor: colors.workspaceBg }}
              onClick={openManageProject}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: colors.accent }}
                >
                  {getProjectInitials(selectedProject?.name)}
                </div>
                {showLabels && (
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-gray-700 truncate max-w-[120px]">
                      {projectLabel}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate max-w-[120px]">
                      {sprintLabel}
                    </div>
                  </div>
                )}
              </div>
              {showLabels && <ChevronDown size={13} className="text-gray-400 shrink-0" />}
            </div>
          </div>

          {/* Menu label */}
          <p
            className={`px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider transition-opacity duration-300 ${showLabels ? 'opacity-100' : 'opacity-0'}`}
          >
            Menu
          </p>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-colors min-w-0"
                  style={{
                    backgroundColor: active ? colors.primaryLight : undefined,
                    color: active ? colors.primary : colors.gray700,
                  }}
                >
                  <div className="w-6 flex items-center justify-center shrink-0">
                    <Icon size={15} style={{ color: active ? colors.primary : colors.gray700 }} />
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
          <div className="mx-3 border-t border-gray-100" />

          {/* User */}
          <div
            className={`flex items-center py-3.5 ${showLabels ? 'gap-2.5 px-4' : 'justify-center px-0'}`}
          >
            <Link
              href={`/${orgSlug}/profile`}
              className={`
                flex
                items-center
                gap-2.5
                min-w-0
                group
                cursor-pointer
                ${showLabels ? 'flex-1' : 'justify-center w-full'}
              `}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 group-hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.accent }}
              >
                {getInitials(user.name)}
              </div>
              {showLabels && (
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
          </div>
        </aside>
      </div>

      {/* Manage Project Modal */}
      {showManageProject && (
        <div className="fixed inset-0 z-[100] flex items-start justify-start">
          <div className="fixed inset-0 bg-black/20" onClick={() => setShowManageProject(false)} />
          <div
            ref={modalRef}
            className="relative z-10 mt-[60px] ml-[72px] w-[300px] rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <h2 className="text-sm font-semibold text-gray-900">Manage Project</h2>
              <button
                onClick={() => setShowManageProject(false)}
                className="w-6 h-6 rounded-full border border-red-300 flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            <div className="px-5 pb-5 max-h-[70vh] overflow-y-auto">
              {/* Projects */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">
                  Projects <span className="text-red-500">*</span>
                </p>
                {isOrgAdmin && (
                  <button
                    onClick={() => {
                      setShowManageProject(false);
                      router.push(`/${orgSlug}/projects?openCreate=true`);
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium border transition-colors hover:bg-gray-50"
                    style={{ color: colors.primary, borderColor: colors.primary }}
                  >
                    <Plus size={10} />
                    New Project
                  </button>
                )}
              </div>
              {isLoadingProjectsWithSprints ? (
                <div className="text-xs text-gray-400 py-2">Loading projects...</div>
              ) : (
                <div className="space-y-1 mb-4">
                  {projectsWithSprints.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setTempProject(p);
                        setTempSprint(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${tempProject?.id === p.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${tempProject?.id === p.id ? 'border-blue-600' : 'border-gray-300'
                            }`}
                        >
                          {tempProject?.id === p.id && (
                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <span
                          className="font-medium text-gray-800 truncate max-w-[180px]"
                          title={p.name}
                        >
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium">{p.key}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowManageProject(false);
                            router.push(`/${orgSlug}/projects/sprints?projectId=${p.id}`);
                          }}
                          className="p-0.5 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye size={13} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Sprints */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-700">
                  Sprints <span className="text-red-500">*</span>
                </p>
                {isOrgAdmin && (
                  <button
                    onClick={() => {
                      if (!tempProject) return;
                      dispatch(
                        setSelectedProject(tempProject as Parameters<typeof setSelectedProject>[0])
                      );
                      dispatch(setSprints(tempSprints));
                      setShowManageProject(false);
                      router.push(
                        `/${orgSlug}/projects/sprints?projectId=${tempProject.id}&openCreate=true`
                      );
                    }}
                    disabled={!tempProject}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium border transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ color: colors.primary, borderColor: colors.primary }}
                  >
                    <Plus size={10} />
                    New Sprint
                  </button>
                )}
              </div>
              {isLoadingProjectsWithSprints ? (
                <div className="text-xs text-gray-400 py-2">Loading sprints...</div>
              ) : (
                <div className="space-y-1">
                  {/* All Sprints option */}
                  <button
                    onClick={() => setTempSprint(null)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${tempSprint === null
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${tempSprint === null ? 'border-blue-600' : 'border-gray-300'
                        }`}
                    >
                      {tempSprint === null && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span className="font-medium text-gray-800">All Sprints</span>
                  </button>

                  {tempSprints?.map((s) => {
                    const statusColor =
                      s.status === 'active'
                        ? 'text-green-600'
                        : s.status === 'completed'
                          ? 'text-gray-400'
                          : 'text-blue-500';
                    const statusLabel =
                      s.status === 'active'
                        ? 'Active'
                        : s.status === 'completed'
                          ? 'Completed'
                          : 'Planned';
                    return (
                      <button
                        key={s.id}
                        onClick={() => setTempSprint(s)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${tempSprint?.id === s.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50 border border-transparent'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${tempSprint?.id === s.id ? 'border-blue-600' : 'border-gray-300'
                              }`}
                          >
                            {tempSprint?.id === s.id && (
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <span className="font-medium text-gray-800">{s.name}</span>
                        </div>
                        <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                      </button>
                    );
                  })}

                  {!isLoadingProjectsWithSprints && tempSprints?.length === 0 && tempProject && (
                    <p className="text-xs text-gray-400 px-3 py-2">No sprints found</p>
                  )}
                  {!tempProject && (
                    <p className="text-xs text-gray-400 px-3 py-2">Select a project first</p>
                  )}
                </div>
              )}
            </div>

            {/* Apply button */}
            <div className="px-5 pb-5">
              <button
                onClick={handleApply}
                disabled={!tempProject}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: colors.primary }}
              >
                <Zap size={15} />
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
