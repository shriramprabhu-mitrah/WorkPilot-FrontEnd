'use client';

import { useEffect, useRef, useState } from 'react';
import { TrackrLogoSvg } from '@/src/assets/svgs';
import { WpButton } from '@/src/app/components/common/button';
import { ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react';
import {
  useCreateOrganization,
  useInviteUsers,
  useUpdateOrganization,
  useGetCountries,
} from '../../hooks/useOrganization';
import { INDUSTRY_TYPE, COMPANY_SIZE, ROLE_TYPE } from '@/src/app/components/common/enum';
import { colors } from '@/src/styles/colors';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { userService } from '@/src/services/user';
import { setUser } from '@/src/store/slices/users';

interface OrgSetupModalProps {
  onComplete?: () => void;
}

// Helper: Convert enum value to readable label
const toLabel = (val: string) => val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const OrganizationSetupModal = ({ onComplete }: OrgSetupModalProps) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [industry, setIndustry] = useState<string>(INDUSTRY_TYPE.IT);
  const [orgSize, setOrgSize] = useState<string>(COMPANY_SIZE.SIZE_11_50);
  const [countryId, setCountryId] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [teamMembers, setTeamMembers] = useState([{ email: '', role: ROLE_TYPE.DEVELOPER }]);

  const { countries, isCountriesLoading } = useGetCountries();

  // Branding state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Hooks
  const { createOrg, isCreatingOrg } = useCreateOrganization();
  const { inviteOrgUsers, isInvitingUsers } = useInviteUsers();
  const { updateOrg, isUpdatingOrg } = useUpdateOrganization();
  const [error, setError] = useState<string | null>(null);

  const isLoading = isCreatingOrg || isInvitingUsers || isUpdatingOrg;
  const countryRef = useRef<HTMLDivElement>(null);

  const completeSetup = async (uploadLogo: boolean) => {
    const formData = new FormData();

    formData.append('name', orgName);
    formData.append('domain', orgSlug);
    formData.append('industry', industry);
    formData.append('team_size', orgSize);
    formData.append('country_id', String(countryId));

    if (logoFile) {
      formData.append('logo', logoFile);
    }

    await createOrg(formData);
    const validMembers = teamMembers.filter((m) => m.email.trim() !== '');
    if (validMembers.length > 0) {
      await inviteOrgUsers({ members: validMembers });
    }
    if (uploadLogo && logoFile) {
      await updateOrg({
        logo: logoFile || '',
      });
    }
    const userProfile = await userService.getUserProfile();
    dispatch(
      setUser({
        name: userProfile.name || userProfile.full_name,
        username: userProfile.username,
        email: userProfile.email,
        role: userProfile.role,
        avatar_url: userProfile.avatar_url,
        is_active: userProfile.is_active,
      })
    );

    router.push('/dashboard');
  };

  const filteredCountries =
    countries?.data?.filter((country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase())
    ) || [];

  const handleNextStep = async () => {
    setError(null);

    try {
      if (step === 1) {
        setStep(2);
        return;
      }

      if (step === 2) {
        setStep(3);
        return;
      }

      await completeSetup(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during setup');
    }
  };

  const handleSkipStep = async () => {
    setError(null);
    try {
      if (step === 2) {
        setStep(3);
        return;
      }
      await completeSetup(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during setup');
    }
  };
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { email: '', role: ROLE_TYPE.DEVELOPER }]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-4 flex flex-col items-center text-center">
          <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-200">
            <TrackrLogoSvg />
          </div>

          <h1 className="text-4xl font-bold text-gray-900">Welcome to WorkPilot</h1>

          <p className="mt-3 max-w-xl text-gray-500">
            You are just a few steps away from creating your teams workspace.
          </p>
        </div>

        <div className="mb-8">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{
                width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
              }}
            />
          </div>
        </div>
        {/* Stepper */}
        <div className="flex items-center justify-center w-full mb-8 sm:mb-12">
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
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set up your organization</h2>
            <p className="text-gray-500 mb-8">This step is required to access your workspace.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Organization name <span className="text-red-500">*</span>
                </label>
                <input
                  id="orgName"
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Organization URL (slug) <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    workpilot.app/
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
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    {Object.values(INDUSTRY_TYPE).map((val) => (
                      <option key={val} value={val}>
                        {toLabel(val)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    Organization size <span className="text-red-500">*</span>
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

              {/* Country */}
              <div className="relative" ref={countryRef}>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Country / Region <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  placeholder="Search country..."
                  value={countrySearch}
                  onFocus={() => setShowCountryDropdown(true)}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    setShowCountryDropdown(true);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {showCountryDropdown && (
                  <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => {
                            setCountryId(country.id);
                            setCountrySearch(`${country.flag_emoji} ${country.name}`);
                            setShowCountryDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 text-sm"
                        >
                          {country.flag_emoji} {country.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">No countries found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <div className="flex justify-between items-center mt-10">
              <WpButton
                variant="ghost"
                size="sm"
                // onClick={onComplete}
                leftIcon={<ArrowLeft size={18} />}
                className="text-gray-500 hover:text-gray-900"
              >
                Back to Sign Up
              </WpButton>
              <WpButton
                onClick={handleNextStep}
                disabled={
                  !orgName.trim() ||
                  !orgSlug.trim() ||
                  !industry ||
                  !orgSize ||
                  !countryId ||
                  isLoading
                }
                isLoading={isLoading}
              >
                Next
              </WpButton>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Team Setup ─── */}
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
                      <input
                        type="email"
                        placeholder="teammate@company.com"
                        value={member.email}
                        onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

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
              <WpButton
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={isLoading}
                leftIcon={<ArrowLeft size={16} />}
                className="text-gray-500 hover:text-gray-900"
              >
                Back
              </WpButton>
              <div className="flex gap-3">
                <WpButton variant="secondary" onClick={handleSkipStep} disabled={isLoading}>
                  Skip for now
                </WpButton>
                <WpButton onClick={handleNextStep} isLoading={isLoading}>
                  Next
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
              Upload your logo. You can always update this later.
            </p>

            <div className="space-y-8 mb-10">
              {/* Company Logo Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Company logo</label>
                <div className="flex gap-4 items-center">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <TrackrLogoSvg />
                    )}
                  </div>

                  {/* Drop zone */}
                  <div
                    className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors p-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={20} className="text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {logoFile ? logoFile.name : 'Click to upload'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">PNG, SVG, JPG — up to 2 MB</span>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* Clear button */}
                  {logoFile && (
                    <button
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors bg-white shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Workspace Preview */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                  style={{ backgroundColor: colors.primary }}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                  ) : orgName ? (
                    orgName.charAt(0).toUpperCase()
                  ) : (
                    'O'
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{orgName || 'Your Organization'}</p>
                  <p className="text-sm text-gray-500">workpilot.app/{orgSlug || 'your-org'}</p>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex justify-between items-center">
              <WpButton
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={isLoading}
                leftIcon={<ArrowLeft size={16} />}
                className="!text-gray-500 hover:!text-gray-900"
              >
                Back
              </WpButton>
              <div className="flex gap-3">
                <WpButton variant="secondary" onClick={handleSkipStep} disabled={isLoading}>
                  Skip for now
                </WpButton>
                <WpButton
                  onClick={handleNextStep}
                  isLoading={isLoading}
                  disabled={isLoading}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Finish Setup
                </WpButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    // </div>
    // </div>
  );
};
