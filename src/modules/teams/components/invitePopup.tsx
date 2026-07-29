'use client';

import { useState } from 'react';
import { X, Mail, Plus } from 'lucide-react';
import { ROLE_TYPE } from '@/src/app/components/common/enum';
import { useInviteUsers } from '../../organization/hooks/useOrganization';

interface Member {
  email: string;
  role: ROLE_TYPE;
}

interface InviteTeamModalProps {
  open: boolean;
  onClose: () => void;
}

const ROLES: ROLE_TYPE[] = [
  ROLE_TYPE.DEVELOPER,
  ROLE_TYPE.PROJECT_MANAGER,
  ROLE_TYPE.VIEWER,
  ROLE_TYPE.GUEST,
];

export default function InviteTeamModal({ open, onClose }: InviteTeamModalProps) {
  const [members, setMembers] = useState<Member[]>([{ email: '', role: ROLE_TYPE.DEVELOPER }]);
  const { inviteOrgUsers, isInvitingUsers } = useInviteUsers();
  const addMember = () => {
    setMembers([...members, { email: '', role: ROLE_TYPE.DEVELOPER }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = <K extends keyof Member>(index: number, field: K, value: Member[K]) => {
    setMembers(members.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async () => {
    const validMembers = members.filter((m) => m.email.trim() !== '');
    if (validMembers.length > 0) {
      await inviteOrgUsers({ members: validMembers });
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
    setMembers([{ email: '', role: ROLE_TYPE.DEVELOPER }]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Invite Team Members</h2>
            <p className="text-sm text-gray-500 mt-1">
              Members will receive an email invitation to join Acme Corp.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 max-h-[55vh] overflow-y-auto">
          {members.map((member, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-semibold text-gray-700">Member {index + 1}</span>
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(index)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-1.5 py-0.5 rounded"
                  >
                    <X size={12} /> Remove
                  </button>
                )}
              </div>

              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="email"
                    placeholder="email@company.com"
                    value={member.email}
                    onChange={(e) => updateMember(index, 'email', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <select
                  value={member.role}
                  onChange={(e) => updateMember(index, 'role', e.target.value as ROLE_TYPE)}
                  className="min-w-[130px] px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white outline-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button
            onClick={addMember}
            className="w-full mt-1 mb-4 py-2.5 border-[1.5px] border-dashed border-blue-300 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 hover:bg-blue-100"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-1 py-2"
          >
            Cancel
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {members.length} member{members.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleSubmit}
              disabled={isInvitingUsers}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg whitespace-nowrap  disabled:opacity-70"
            >
              {isInvitingUsers ? 'Submitting...' : 'Submit Invitations'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
