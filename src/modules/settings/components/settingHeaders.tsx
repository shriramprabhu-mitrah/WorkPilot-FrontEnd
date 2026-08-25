'use client';

export type SettingsTab =
  | 'General'
  | 'Notifications'
  | 'Members'
  | 'Permissions'
  | 'Status'
  | 'Security'
  | 'Billing';

interface SettingsHeaderProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const tabs: SettingsTab[] = ['General', 'Members', 'Permissions', 'Status', 'Security', 'Billing'];

export default function SettingsHeader({ activeTab, onTabChange }: SettingsHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
      <div className="mt-5 flex w-fit overflow-x-auto items-center gap-1 rounded-xl bg-gray-100 dark:bg-slate-800 p-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`shrink-0 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm ring-1 ring-gray-200 dark:ring-slate-600'
                : 'text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
