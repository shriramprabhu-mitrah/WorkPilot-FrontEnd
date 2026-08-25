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
import MembersSettings from '../components/memberSetting';
import { BillingSettings } from '../components/billingSettings';

export const SettingPageTemplate = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');
  const { isOrganizationLoading } = useGetOrganization();
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
      {activeTab === 'Members' && <MembersSettings />}
      {activeTab === 'Permissions' && <Permissions />}
      {activeTab === 'Status' && <StatusSettings />}
      {activeTab === 'Security' && <SecuritySetting />}
      {activeTab === 'Billing' && <BillingSettings />}
    </>
  );
};
