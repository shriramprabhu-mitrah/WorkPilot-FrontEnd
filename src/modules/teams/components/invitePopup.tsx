'use client';

import { useState } from 'react';
import { X, Mail, Plus } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { useInviteUsers } from '../../organization/hooks/useOrganization';

interface Member {
  email: string;
}

interface InviteTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InviteTeamModal({ open, onClose }: InviteTeamModalProps) {
  const [members, setMembers] = useState<Member[]>([{ email: '' }]);
  const { inviteOrgUsers, isInvitingUsers } = useInviteUsers();

  const addMember = () => setMembers([...members, { email: '' }]);
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i));
  const updateMember = <K extends keyof Member>(i: number, field: K, value: Member[K]) =>
    setMembers(members.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));

  const handleSubmit = async () => {
    const valid = members.filter((m) => m.email.trim() !== '');
    if (valid.length > 0) await inviteOrgUsers({ members: valid });
    onClose();
  };

  const handleCancel = () => {
    onClose();
    setMembers([{ email: '' }]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Invite Team Members
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Members will receive an email invitation to join.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md p-1 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[55vh] overflow-y-auto">
          {members.map((member, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 mb-3.5 bg-gray-50 dark:bg-slate-700/40"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                  Member {index + 1}
                </span>
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(index)}
                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-1.5 py-0.5 rounded transition-colors"
                  >
                    <X size={12} /> Remove
                  </button>
                )}
              </div>
              <WpInput
                type="email"
                placeholder="email@company.com"
                value={member.email}
                onChange={(e) => updateMember(index, 'email', e.target.value)}
                icon={<Mail size={16} />}
              />
            </div>
          ))}

          <WpButton
            variant="ghost"
            fullWidth
            onClick={addMember}
            leftIcon={<Plus size={16} />}
            className="mt-1 mb-4 border-[1.5px] border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
          >
            Add Member
          </WpButton>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-700">
          <WpButton
            variant="ghost"
            onClick={handleCancel}
            className="text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100"
          >
            Cancel
          </WpButton>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-slate-400">
              {members.length} member{members.length > 1 ? 's' : ''}
            </span>
            <WpButton onClick={handleSubmit} isLoading={isInvitingUsers} loadingText="Submitting...">
              Submit Invitations
            </WpButton>
          </div>
        </div>
      </div>
    </div>
  );
}
