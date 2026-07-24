'use client';

import { useState } from 'react';
import { TrackrLogoSvg } from '@/src/assets/svgs';
import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';
import { Check, Upload, X } from 'lucide-react';
import { useOrganization } from '../../hooks/useOrganization';
import { INDUSTRY_TYPE, COMPANY_SIZE } from '@/src/app/components/common/enum';
import { colors } from '@/src/styles/colors';

interface OrgSetupModalProps {
  onComplete: () => void;
}

export const OrganizationSetupModal = ({ onComplete }: OrgSetupModalProps) => {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [industry, setIndustry] = useState<string>(INDUSTRY_TYPE.IT);
  const [orgSize, setOrgSize] = useState<string>(COMPANY_SIZE.SIZE_11_50);
  const [country, setCountry] = useState('India');

  // Team Setup State
  const [teamMembers, setTeamMembers] = useState([{ email: '', role: 'Developer' }]);

  // API Hooks
  const { createOrg, isCreatingOrg, inviteOrgUsers, isInvitingUsers, updateOrg, isUpdatingOrg } =
    useOrganization();
  const [error, setError] = useState<string | null>(null);

  const isLoading = isCreatingOrg || isInvitingUsers || isUpdatingOrg;

  const handleNextStep = async () => {
    setError(null);

    try {
      if (step === 1) {
        // Step 1: Create Organization
        await createOrg({
          name: orgName,
          domain: orgSlug,
          industry,
          logo_url: orgSlug,
          team_size: orgSize,
          country,
        });
        setStep(2);
      } else if (step === 2) {
        // Step 2: Invite Users
        const validMembers = teamMembers.filter((m) => m.email.trim() !== '');
        if (validMembers.length > 0) {
          await inviteOrgUsers({ members: validMembers });
        }
        setStep(3);
      } else if (step === 3) {
        // Step 3: Brand Workspace
        await updateOrg({
          logo_url: '', // We don't have actual file upload implemented yet
        });
        onComplete();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during setup');
    }
  };

  const handleSkipStep = async () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { email: '', role: 'Developer' }]);
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm overflow-y-auto py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center p-10 relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white">
            <TrackrLogoSvg />
          </div>
          <span className="text-xl font-bold text-gray-900">WorkPilot</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center w-full max-w-md mb-12">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              {step > 1 ? <Check size={16} /> : '1'}
            </div>
            <span
              className={`text-xs mt-2 font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}
            >
              Organization
            </span>
          </div>
          <div className={`flex-1 h-px mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              {step > 2 ? <Check size={16} /> : '2'}
            </div>
            <span
              className={`text-xs mt-2 font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}
            >
              Team Setup <span className="text-gray-400 font-normal">(opt)</span>
            </span>
          </div>
          <div className={`flex-1 h-px mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              3
            </div>
            <span
              className={`text-xs mt-2 font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}
            >
              Branding <span className="text-gray-400 font-normal">(opt)</span>
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full bg-white border border-gray-200 rounded-xl p-8">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set up your organization</h2>
              <p className="text-gray-500 mb-8">This step is required to access your workspace.</p>

              <div className="space-y-6">
                <div>
                  <WpInput
                    id="orgName"
                    label="Organization name *"
                    placeholder="e.g. Acme Corp"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Organization URL (slug)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      WorkPilot.app/
                    </span>
                    <input
                      type="text"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      placeholder="acme-corp"
                      className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      {Object.values(INDUSTRY_TYPE).map((val) => (
                        <option key={val} value={val}>
                          {val.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">
                      Organization size
                    </label>
                    <select
                      value={orgSize}
                      onChange={(e) => setOrgSize(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      {Object.values(COMPANY_SIZE).map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Country / Region
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>India</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

              <div className="flex justify-between items-center mt-10">
                <button
                  onClick={onComplete}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  &lt; Back to Sign Up
                </button>
                <WpButton
                  onClick={handleNextStep}
                  disabled={!orgName.trim() || isLoading}
                  isLoading={isLoading}
                >
                  Continue
                </WpButton>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Invite your team</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  Optional
                </span>
              </div>
              <p className="text-gray-500 mb-8">
                Add teammates now or invite them later from Settings.
              </p>

              <div className="space-y-4 mb-6">
                {teamMembers.map((member, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Member {index + 1}
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <WpInput
                          type="email"
                          placeholder="teammate@company.com"
                          value={member.email}
                          onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                          wrapperClassName="!mb-0"
                        />
                      </div>
                      <select
                        value={member.role}
                        onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                        className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option>Developer</option>
                        <option>Manager</option>
                        <option>Admin</option>
                      </select>
                      <button
                        onClick={() => removeTeamMember(index)}
                        className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors bg-white shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addTeamMember}
                  className="w-full py-3 border border-dashed border-blue-300 rounded-xl text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span>+</span> Add Another Member
                </button>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-sm text-blue-800 mb-8">
                <div className="shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center text-xs font-serif italic">
                    i
                  </div>
                </div>
                <p>
                  Invitees will receive an email to join{' '}
                  <strong className="font-semibold">{orgName || 'your organization'}</strong> on
                  WorkPilot. You can manage team members any time from{' '}
                  <strong>Settings &rarr; Members</strong>.
                </p>
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={isLoading}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50"
                >
                  &lt; Back
                </button>
                <div className="flex gap-3">
                  <WpButton variant="secondary" onClick={handleSkipStep} disabled={isLoading}>
                    Skip for now
                  </WpButton>
                  <WpButton onClick={handleNextStep} isLoading={isLoading}>
                    Continue
                  </WpButton>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Brand your workspace</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                  Optional
                </span>
              </div>
              <p className="text-gray-500 mb-8">
                Upload your logo and choose brand colors. You can always update this later.
              </p>

              <div className="space-y-8 mb-10">
                {/* Company Logo */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Company logo</h3>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                      <TrackrLogoSvg />
                    </div>
                    <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors p-4">
                      <Upload size={20} className="text-blue-500 mb-2" />
                      <span className="text-sm font-medium text-gray-700">Click to upload</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, SVG, JPG — up to 2 MB</span>
                    </div>
                  </div>
                </div>

                {/* Preview block */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {orgName ? orgName.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{orgName || 'Your Organization'}</p>
                    <p className="text-sm text-gray-500">WorkPilot.app/{orgSlug || 'your-org'}</p>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="flex justify-between items-center">
                <button
                  onClick={handleBack}
                  disabled={isLoading}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50"
                >
                  &lt; Back
                </button>
                <div className="flex gap-3">
                  <WpButton variant="secondary" onClick={handleSkipStep} disabled={isLoading}>
                    Skip for now
                  </WpButton>
                  <WpButton onClick={handleNextStep} isLoading={isLoading}>
                    Finish Setup &rarr;
                  </WpButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
