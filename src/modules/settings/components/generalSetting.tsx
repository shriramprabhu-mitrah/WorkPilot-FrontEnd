'use client';

import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector } from '@/src/store';
import {
  useGetCountries,
  useGetOrganization,
  useUpdateOrganization,
} from '@/src/modules/organization/hooks/useOrganization';
import { WpDropdown, WpDropdownOption } from '@/src/app/components/common/dropdown';
import { WpInput } from '@/src/app/components/common/input';
import { WpButton } from '@/src/app/components/common/button';
import { INDUSTRY_TYPE } from '@/src/app/components/common/enum';
import { ImagePlus, Upload } from 'lucide-react';
import Image from 'next/image';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  domain: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(val),
      'Enter a valid domain (e.g. example.com)'
    ),
  industry: z.string().optional().or(z.literal('')),
  team_size: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  logo: z.instanceof(File).optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

const industryOptions: WpDropdownOption[] = [
  { label: 'Information Technology', value: INDUSTRY_TYPE.IT },
  { label: 'Finance', value: INDUSTRY_TYPE.FINANCE },
  { label: 'Healthcare', value: INDUSTRY_TYPE.HEALTHCARE },
  { label: 'Education', value: INDUSTRY_TYPE.EDUCATION },
  { label: 'Retail', value: INDUSTRY_TYPE.RETAIL },
  { label: 'Manufacturing', value: INDUSTRY_TYPE.MANUFACTURING },
  { label: 'Other', value: INDUSTRY_TYPE.OTHER },
];

const teamSizeOptions: WpDropdownOption[] = [
  { label: '1-10', value: '1-10' },
  { label: '11-50', value: '11-50' },
  { label: '51-200', value: '51-200' },
  { label: '201-500', value: '201-500' },
  { label: '501-1000', value: '501-1000' },
  { label: '1000+', value: '1000+' },
];

export default function GeneralSettings() {
  const organization = useAppSelector((state) => state.organization);
  const { updateOrg, isUpdatingOrg } = useUpdateOrganization();
  const { refetchOrganization } = useGetOrganization();
  const { countries } = useGetCountries();

  const countryOptions: WpDropdownOption[] =
    countries?.data?.map((c) => ({
      label: c.name,
      value: c.id,
    })) ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      domain: '',
      industry: '',
      team_size: '',
      country: '',
    },
  });

  const logo = watch('logo');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (organization) {
      setValue('name', organization?.name ?? '');
      setValue('domain', organization?.domain ?? '');
      setValue('industry', organization?.industry ?? '');
      setValue('team_size', organization?.team_size ?? '');
      setValue(
        'country',
        countryOptions.find((a) => a.label === organization.country)?.value || ''
      );
      // setValue('logo_url', organization?.logo_url ?? '');
    }
  }, [organization, reset]);

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      await updateOrg({
        name: data.name,
        domain: data.domain,
        logo: data.logo,
        industry: data.industry,
        team_size: data.team_size,
        country_id: data.country,
      });
      await refetchOrganization();
    } catch (error) {}
  };

  return (
    <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Organization Details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
        <WpInput
          id="name"
          label="Organization Name"
          showRequired
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="mb-5">
          <label className="mb-2 block text-sm font-bold text-[var(--color-text-body)]">
            Organization Slug
          </label>
          <div className="flex overflow-hidden rounded-lg border border-[var(--color-gray-300)] bg-[var(--color-gray-100)]">
            <span className="flex items-center bg-[var(--color-gray-100)] px-3 text-sm text-[var(--color-gray-400)]">
              workPilot/
            </span>
            <input
              type="text"
              value={organization?.slug || ''}
              readOnly
              className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none cursor-not-allowed text-[var(--color-gray-400)]"
            />
          </div>
          <p className="mt-1 text-xs text-[var(--color-gray-400)]">Slug cannot be changed</p>
        </div>

        <WpInput
          id="domain"
          label="Domain"
          placeholder="example.com"
          error={errors.domain?.message}
          {...register('domain')}
        />

        <Controller
          control={control}
          name="industry"
          render={({ field }) => (
            <WpDropdown
              label="Industry"
              placeholder="Select Industry"
              options={industryOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.industry?.message}
              disabled={true}
            />
          )}
        />

        <Controller
          control={control}
          name="team_size"
          render={({ field }) => (
            <WpDropdown
              label="Team Size"
              placeholder="Select Team Size"
              options={teamSizeOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.team_size?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <WpDropdown
              label="Country"
              placeholder="Select Country"
              options={countryOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.country?.message}
            />
          )}
        />

        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold text-gray-700">Organization Logo</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) {
                setValue('logo', file, {
                  shouldValidate: true,
                });
              }
            }}
            className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3 transition hover:border-blue-500 hover:bg-blue-50"
          >
            <div className="flex items-center gap-5">
              {/* Avatar Preview */}
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-white">
                {logo ? (
                  <Image
                    src={URL.createObjectURL(logo)}
                    alt="Organization Logo"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : organization?.logo_url ? (
                  <Image
                    src={organization.logo_url}
                    alt="Organization Logo"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <ImagePlus className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Upload Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-xs text-gray-900">Change Logo</h3>

                <p className="mt-1 text-xs text-gray-500">PNG, JPG or JPEG • Max 5 MB</p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white">
                  <Upload size={18} />
                  Choose File
                </div>

                <p className="mt-3 text-xs text-gray-400">or drag & drop your image here</p>
              </div>
            </div>
          </div>
          <WpInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setValue('logo', file, {
                  shouldValidate: true,
                });
              }
            }}
          />
        </div>

        <div className="border-t border-[var(--color-gray-200)] pt-5">
          <div className="flex justify-end">
            <WpButton type="submit" isLoading={isUpdatingOrg} loadingText="Saving...">
              Save Changes
            </WpButton>
          </div>
        </div>
      </form>
    </div>
  );
}
