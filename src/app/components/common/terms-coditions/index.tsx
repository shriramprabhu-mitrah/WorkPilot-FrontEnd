'use client';

import { colors } from '@/src/styles/colors';
import { WpCheckbox } from '../checkbox';
import { WpButton } from '@/src/app/components/common/button';
import { useAppDispatch, useAppSelector } from '@/src/store';
import { setTermsAccepted } from '@/src/store/slices/agreement';

const hr = {
  margin: '32px 0',
  border: 'none',
  borderTop: `1px solid ${colors.borderLight}`,
} as const;
const linkStyle = { color: colors.primaryFocus } as const;

interface TermsConditionsProps {
  onContinue: () => void;
}

export const TermsConditions = ({ onContinue }: TermsConditionsProps) => {
  const dispatch = useAppDispatch();
  const accepted = useAppSelector((state) => state.agreement.termsAccepted);
  const handleContinue = () => {
    onContinue();
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        paddingTop: '72px',
        paddingRight: '56px',
        paddingBottom: '40px',
        paddingLeft: '40px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        color: colors.textBody,
      }}
    >
      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>

        <p className="mt-2 text-sm ms-3 text-gray-500">
          Last Updated: <span className="font-medium">July 2026</span>
        </p>

        <div className="mt-6">
          <h2 className="text-2xl ms-2 font-semibold text-gray-900">Welcome to WorkPilot</h2>

          <p className="mt-4 leading-7 ms-3 text-gray-600">
            Welcome to <strong>WorkPilot</strong>, a collaborative project management platform that
            helps teams plan projects, manage tasks, organize sprints, track progress, and work
            together efficiently.
          </p>

          <p className="mt-4 leading-7 ms-3 text-gray-600">
            By accessing or using WorkPilot, you agree to comply with these Terms & Conditions. If
            you do not agree, please discontinue use of the application.
          </p>
        </div>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">1. Eligibility</h2>

        <p className="leading-7 ms-7 text-gray-600">
          You must be at least <strong>18 years of age</strong>, or have authorization from your
          organization, to create and use a WorkPilot account.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">2. User Accounts</h2>
        <p className="leading-7 ms-7 text-gray-600">When creating an account, you agree to:</p>
        <ul className="mb-5 ms-7 list-disc space-y-2 pl-6 text-gray-600">
          <li>Provide accurate and up-to-date information.</li>
          <li>Keep your login credentials secure.</li>
          <li>Maintain the confidentiality of your account.</li>
          <li>Notify us immediately if you suspect unauthorized access.</li>
        </ul>
        <p className="leading-7 ms-7 text-gray-600">
          You are responsible for all activities performed through your account.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">3. Workspace Usage</h2>
        <p className="leading-7 ms-7 text-gray-600">WorkPilot enables users to:</p>
        <ul className="mb-5 ms-7 list-disc space-y-2 pl-6 text-gray-600">
          <li>Create and manage workspaces</li>
          <li>Create and manage projects</li>
          <li>Plan sprints and backlogs</li>
          <li>Assign and track tasks</li>
          <li>Collaborate with team members</li>
          <li>Share files and comments</li>
          <li>Generate reports and dashboards</li>
        </ul>
        <p className="leading-7 ms-7 text-gray-600">
          You agree to use the platform responsibly and in accordance with applicable laws.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">4. Acceptable Use</h2>
        <p className="leading-7 ms-7 text-gray-600">Users must not:</p>
        <ul className="mb-5 ms-7 list-disc space-y-2 pl-6 text-gray-600">
          <li>Upload malicious software or harmful content.</li>
          <li>Attempt unauthorized access to systems or data.</li>
          <li>Interfere with platform performance.</li>
          <li>Harass or abuse other users.</li>
          <li>Violate intellectual property rights.</li>
          <li>Use the platform for unlawful activities.</li>
        </ul>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">5. Intellectual Property</h2>
        <p className="leading-7 ms-7 text-gray-600">
          All trademarks, software, logos, designs, and application content are the property of{' '}
          <strong>WorkPilot</strong> unless otherwise stated.
        </p>
        <p className="leading-7 ms-7 text-gray-600">
          Users retain ownership of the content they create within their own workspaces.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">6. User Content</h2>
        <p className="leading-7 ms-7 text-gray-600">
          Users are responsible for the content they upload, including:
        </p>
        <ul className="mb-5  className='leading-7 ms-7 text-gray-600' list-disc space-y-2 pl-6 text-gray-600">
          <li>Tasks</li>
          <li>Comments</li>
          <li>Documents</li>
          <li>Images</li>
          <li>Attachments</li>
          <li>Project data</li>
        </ul>
        <p className="leading-7 ms-7 text-gray-600">
          By uploading content, you grant WorkPilot permission to store and process it solely to
          provide the service.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">7. Data Protection</h2>
        <p className="leading-7 ms-7 text-gray-600">
          WorkPilot implements reasonable technical and organizational measures to safeguard your
          information from unauthorized access, alteration, or disclosure.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">8. Account Suspension</h2>
        <p className="leading-7 ms-7 text-gray-600">
          We reserve the right to suspend or terminate accounts that:
        </p>
        <ul className="mb-5 ms-7 list-disc space-y-2 pl-6 text-gray-600">
          <li>Violate these Terms.</li>
          <li>Engage in fraudulent or illegal activities.</li>
          <li>Compromise the security or stability of the platform.</li>
        </ul>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">9. Limitation of Liability</h2>
        <p className="leading-7 ms-7 text-gray-600">
          WorkPilot is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
        </p>
        <p className="leading-7 ms-7 text-gray-600">We are not liable for:</p>
        <ul className="mb-5 ms-7 list-disc space-y-2 pl-6 text-gray-600">
          <li>Data loss caused by user actions.</li>
          <li>Third-party service outages.</li>
          <li>Internet connectivity issues.</li>
          <li>Losses arising from misuse of the platform.</li>
        </ul>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">10. Changes to These Terms</h2>
        <p className="leading-7 ms-9 text-gray-600">
          We may update these Terms from time to time. Continued use of WorkPilot after updates
          indicates your acceptance of the revised Terms.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">11. Contact Us</h2>
        <p className="leading-7 ms-9 text-gray-600">
          For questions regarding these Terms, please contact:
        </p>
        <p className="leading-7 ms-9 text-gray-600">
          <strong>WorkPilot Support</strong>
          <br />
          Email:{' '}
          <a href="mailto:support@WorkPilot.com" style={linkStyle}>
            support@WorkPilot.com
          </a>
        </p>
      </div>
      <hr style={hr} />

      <div
        style={{
          marginTop: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <WpCheckbox
          id="accept-terms"
          checked={accepted}
          onChange={(e) => dispatch(setTermsAccepted(e.target.checked))}
          label="I have read and agree to the Terms & Conditions."
        />
        <WpButton
          type="button"
          size="sm"
          disabled={!accepted}
          onClick={handleContinue}
          className="mt-5 w-full"
        >
          Continue
        </WpButton>
      </div>
    </div>
  );
};
