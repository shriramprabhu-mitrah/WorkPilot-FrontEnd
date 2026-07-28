'use client';
import { useState } from 'react';
import GeneralSettings from '../components/generalSetting';
import SettingsHeader, { SettingsTab } from '../components/SettingHeader';
import PermissionsMatrix from '../components/PermissionMatrix';
import RolePermission from '../components/RolesPermission';
import { NotificationSettings } from '../components/NotificationSetting';
import { SecuritySetting } from '../components/SecuritySetting';

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
