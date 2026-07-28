'use client';
import { useState } from 'react';
import GeneralSettings from '../components/generalSetting';
import SettingsHeader, { SettingsTab } from '../components/settingHeader';
import PermissionsMatrix from '../components/permissionMatrix';
import RolePermission from '../components/rolesPermission';
import { NotificationSettings } from '../components/notificationSetting';
import { SecuritySetting } from '../components/securitySetting';

export const SettingPageTemplate = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');
  return (
    <>
      <SettingsHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'General' && <GeneralSettings />}
      {activeTab === 'Permissions Matrix' && <PermissionsMatrix />}
      {activeTab === 'Roles & Permissions' && <RolePermission />}
      {activeTab === 'Notifications' && <NotificationSettings />}
      {activeTab === 'Security' && <SecuritySetting />}
    </>
  );
};
