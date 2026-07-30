'use client';

export type SettingsTab =
  'General' | 'Roles & Permissions' | 'Permissions Matrix' | 'Notifications' | 'Security';

interface SettingsHeaderProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const tabs: SettingsTab[] = [
  'General',
  'Roles & Permissions',
  'Permissions Matrix',
  'Notifications',
  'Security',
];

export default function SettingsHeader({ activeTab, onTabChange }: SettingsHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="mt-5 flex w-fit items-center gap-2 rounded-xl bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
