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
  const addMember = () => {
    setMembers([...members, { email: '' }]);
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
    setMembers([{ email: '' }]);
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
            className="mt-1 mb-4 border-[1.5px] border-dashed border-blue-300 bg-blue-50"
          >
            Add
          </WpButton>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <WpButton variant="ghost" onClick={handleCancel} className="text-gray-600 hover:text-gray-900">
            Cancel
          </WpButton>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {members.length} member{members.length > 1 ? 's' : ''}
            </span>
            <WpButton
              onClick={handleSubmit}
              isLoading={isInvitingUsers}
              loadingText="Submitting..."
            >
              Submit Invitations
            </WpButton>
          </div>
        </div>
      </div>
    </div>
  );
}
