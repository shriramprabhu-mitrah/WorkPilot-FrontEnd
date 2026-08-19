'use client';

import { useState } from 'react';
import {
  Crown,
  Building2,
  BriefcaseBusiness,
  Code2,
  Eye,
  CheckCircle2,
  Ban,
  Info,
  History,
  Lock,
} from 'lucide-react';
import { auditLogs, rolesData } from '../data/rolesJson';

const roleIcons = {
  'Super Admin': Crown,
  'Organization Admin': Building2,
  'Project Manager': BriefcaseBusiness,
  Developer: Code2,
  Viewer: Eye,
};

export default function RolePermission() {
  const [selectedRole, setSelectedRole] = useState(rolesData[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoles = rolesData.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const RoleIcon = roleIcons[selectedRole.name as keyof typeof roleIcons] || Eye;

  return (
    <div className="w-250 space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {rolesData.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole.id === role.id;

          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`rounded-xl border p-4 text-center transition ${
                isSelected ? `${role.borderColor} ${role.activeBg}` : 'border-gray-200 bg-white'
              }`}
            >
              <div
                className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
                  role.iconBg
                }`}
              >
                <Icon className={`h-4 w-4 ${role.iconColor}`} />
              </div>

              <div className={`text-2xl font-bold ${role.iconColor}`}>{role.number}</div>

              <div className="mt-1 text-xs text-gray-600">{role.name}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[180px_1fr]">
        <div className="w-60 rounded-xl p-3">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            {filteredRoles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? `${role.borderColor} ${role.activeBg} ${role.iconColor}`
                      : 'border-transparent text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${role.iconColor}`} />
                  <span className="flex-1">{role.name}</span>

                  <span className="text-xs text-gray-400">{role.number}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="ml-10 mt-3 space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${selectedRole.iconBg}`}
                >
                  <RoleIcon size={18} className="text-gray-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-gray-900">{selectedRole.name}</h2>

                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs ${selectedRole.activeBg} ${selectedRole.iconColor}`}
                  >
                    {selectedRole.scope}
                  </span>
                </div>
              </div>

              {/* <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                Edit role
              </button> */}
            </div>
            <p className="mt-2 ml-2 text-xs text-gray-500">{selectedRole.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <CheckCircle2 size={16} className="text-green-500" />
                Key Capabilities
              </h3>

              <div className="space-y-2.5">
                {selectedRole.capabilities.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Lock size={16} className="text-red-500" />
                Key Restrictions
              </h3>

              <div className="space-y-2.5">
                {selectedRole.restrictions.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <Ban size={15} className="mt-0.5 shrink-0 text-red-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Info size={17} className="mt-0.5 shrink-0 text-blue-500" />
              <div>
                <h3 className="text-xs font-semibold text-blue-700">Real-World Analogy</h3>

                <p className="mt-1 text-xs text-blue-600">{selectedRole.analogyDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-5 flex items-center gap-2">
          <History size={17} className="text-gray-500" />

          <h3 className="text-sm font-semibold text-gray-800">Role Change Audit Log</h3>
        </div>

        <div className="space-y-5">
          {auditLogs.map((log) => {
            const isSuccess = log.type === 'success';
            const isAdd = log.type === 'add';
            const isWarning = log.type === 'warning';
            const isError = log.type === 'error';

            const LogIcon = log.icon;

            return (
              <div key={log.id} className="flex gap-3">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    isSuccess
                      ? 'bg-green-50 text-green-500'
                      : isAdd
                        ? 'bg-blue-50 text-blue-500'
                        : isWarning
                          ? 'bg-yellow-50 text-yellow-500'
                          : isError
                            ? 'bg-red-50 text-red-500'
                            : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  <LogIcon size={15} />
                </div>

                <div>
                  <p className="text-xs text-gray-700">{log.text}</p>

                  <p className="mt-1 text-xs text-gray-400">{log.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
