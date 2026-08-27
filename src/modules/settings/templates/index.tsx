'use client';
import { useState } from 'react';
import GeneralSettings from '../components/generalSetting';
import SettingsHeader, { SettingsTab } from '../components/settingHeaders';
import PermissionsMatrix from '../components/permissionMatrixx';
import RolePermission from '../components/rolesPermissions';
// import { NotificationSettings } from '../components/notificationSettings';
import { SecuritySetting } from '../components/securitySettings';
import SettingsSkeleton from '../components/settingSkeleton';
import { useGetOrganization } from '../../organization/hooks/useOrganization';
import Permissions from '../components/permissions';
import StatusSettings from '../components/statusSettings';
import { BillingSettings } from '../components/billingSettings';
import { usePermissions } from '@/src/hooks/usePermissions';
import { TeamTemplate } from '../../teams/templates';

export const SettingPageTemplate = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');
  const { isOrgAdmin } = usePermissions();
  const { isOrganizationLoading } = useGetOrganization(isOrgAdmin);

  if (!isOrgAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 px-3 sm:px-0">
        <div className="flex flex-col items-center justify-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/kanban method-pana.svg"
            alt="Access Restricted"
            className="h-80 w-80 opacity-60 mb-2"
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Access Restricted
          </h2>
          <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400 text-sm">
            Only organization administrators have access to settings.
          </p>
        </div>
      </div>
    );
  }

  if (isOrganizationLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <>
      <SettingsHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'General' && <GeneralSettings />}
      {/* {activeTab === 'Permissions Matrix' && <PermissionsMatrix />} */}
      {/* {activeTab === 'Roles & Permissions' && <RolePermission />} */}
      {/* {activeTab === 'Notifications' && <NotificationSettings />} */}
      {activeTab === 'Members' && <TeamTemplate />}
      {activeTab === 'Permissions' && <Permissions />}
      {activeTab === 'Status' && <StatusSettings />}
      {activeTab === 'Security' && <SecuritySetting />}
      {activeTab === 'Billing' && <BillingSettings />}
    </>
  );
};
