'use client';

import { colors } from '@/src/styles/colors';
// import { WpCheckbox } from '@/src/app/components/common/checkbox';
import { WpButton } from '@/src/app/components/common/button';
// import { useAppDispatch, useAppSelector } from '@/src/store';
// import { setPrivacyAccepted } from '@/src/store/slices/agreement';

const hr = {
  margin: '32px 0',
  border: 'none',
  borderTop: `1px solid ${colors.borderLight}`,
} as const;
const linkStyle = { color: colors.primaryFocus } as const;

interface PrivacyPolicyProps {
  onContinue?: () => void;
  showActions?: boolean;
}
export const PrivacyPolicy = ({ onContinue, showActions = true }: PrivacyPolicyProps) => {
  const handleContinue = () => {
    onContinue?.();
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
        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>

        <p className="mt-2 ms-2 text-sm text-gray-500">
          Last Updated: <span className="font-medium">July 2026</span>
        </p>

        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Privacy Matters</h2>

          <p className="mt-4 leading-7 ms-2 text-gray-600">
            At <strong>WorkPilot</strong>, we respect your privacy and are committed to protecting
            your personal information.
          </p>

          <p className="mt-4 leading-7 ms-2 text-gray-600">
            This Privacy Policy explains how we collect, use, store, and protect your information
            when you use WorkPilot, and outlines your rights regarding your personal data.
          </p>
        </div>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">1. Information We Collect</h1>

        <h3
          style={{
            fontSize: '18px',
            marginLeft: '25px',
            fontWeight: 'bold',
            marginTop: '15px',
            marginBottom: '5px',
          }}
        >
          Personal Information
        </h3>
        <p className="ms-7">We may collect:</p>
        <ul className="mb-5 list-disc space-y-2 ms-8 pl-6 text-gray-600">
          <li>Full Name</li>
          <li>Email Address</li>
          <li>Company Name</li>
          <li>Job Title</li>
          <li>Profile Picture</li>
        </ul>

        <h3
          style={{
            fontSize: '18px',
            marginLeft: '25px',
            fontWeight: 'bold',
            marginTop: '24px',
            marginBottom: '5px',
          }}
        >
          Workspace Information
        </h3>
        <p className="leading-7 ms-7 text-gray-600">
          We store information necessary to provide our services, including:
        </p>
        <ul className="mb-5 mt-1 ms-8 list-disc space-y-2 pl-6 text-gray-600">
          <li>Projects</li>
          <li>Boards</li>
          <li>Tasks</li>
          <li>Sprint Data</li>
          <li>Backlogs</li>
          <li>Reports</li>
          <li>Team Members</li>
          <li>Comments</li>
          <li>Attachments</li>
        </ul>

        <h3
          style={{
            fontSize: '18px',
            marginLeft: '25px',
            fontWeight: 'bold',
            marginTop: '24px',
            marginBottom: '5px',
          }}
        >
          Technical Information
        </h3>
        <p className="leading-7 ms-7 text-gray-600">We may collect:</p>
        <ul className="mb-5 list-disc mt-1 ms-8 space-y-2 pl-6 text-gray-600">
          <li>IP Address</li>
          <li>Browser Type</li>
          <li>Device Information</li>
          <li>Operating System</li>
          <li>Login Activity</li>
          <li>Usage Analytics</li>
        </ul>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">2. How We Use Your Information</h1>
        <p className="ms-7">We use your information to:</p>
        <ul className="mb-5 ms-8 list-disc mt-1 space-y-2 pl-6 text-gray-600">
          <li>Create and manage your account.</li>
          <li>Authenticate users securely.</li>
          <li>Provide project management features.</li>
          <li>Enable collaboration within workspaces.</li>
          <li>Improve application performance.</li>
          <li>Send important notifications.</li>
          <li>Provide technical support.</li>
        </ul>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">3. Cookies</h1>
        <p className="leading-7 ms-7 text-gray-600">
          WorkPilot uses cookies and similar technologies to:
        </p>
        <ul className="mb-5 ms-8 list-disc space-y-2 mt-1 pl-6 text-gray-600">
          <li>Keep you signed in.</li>
          <li>Remember your preferences.</li>
          <li>Improve application performance.</li>
          <li>Enhance your overall user experience.</li>
        </ul>
        <p className="leading-7 ms-7 text-gray-600">
          You can manage or disable cookies through your browser settings, though some features may
          not function correctly.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">4. Data Security</h1>
        <p className="leading-7 ms-7 text-gray-600">
          We use industry-standard security measures, including:
        </p>
        <ul className="mb-5 ms-8 list-disc space-y-2 mt-1 pl-6 text-gray-600">
          <li>HTTPS encryption</li>
          <li>Password hashing</li>
          <li>Secure authentication</li>
          <li>Role-based access control</li>
          <li>Continuous security monitoring</li>
        </ul>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">5. Data Sharing</h1>
        <p className="leading-7 ms-7 text-gray-600">
          We do <strong>not sell</strong> your personal information.
        </p>
        <p className="ms-7">Information may only be shared:</p>
        <ul className="mb-5 ms-8 list-disc space-y-2 mt-1 pl-6 text-gray-600">
          <li>With trusted service providers supporting our platform.</li>
          <li>When required by law.</li>
          <li>To protect our legal rights.</li>
          <li>With your explicit consent.</li>
        </ul>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">6. Data Retention</h1>
        <p className="leading-7 ms-7 text-gray-600">
          Your data is retained only for as long as necessary to:
        </p>
        <ul className="mb-5 ms-8 list-disc space-y-2 mt-1 pl-6 text-gray-600">
          <li>Deliver our services.</li>
          <li>Meet legal obligations.</li>
          <li>Resolve disputes.</li>
          <li>Enforce our agreements.</li>
        </ul>
        <p className="leading-7 ms-7 text-gray-600">
          You may request deletion of your account, subject to applicable legal and contractual
          requirements.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">7. Your Rights</h1>
        <p className="leading-7 ms-7 text-gray-600">
          Depending on your location, you may have the right to:
        </p>
        <ul className="mb-5 ms-8 list-disc space-y-2 pl-6 mt-1 text-gray-600">
          <li>Access your personal information.</li>
          <li>Update or correct your information.</li>
          <li>Export your data.</li>
          <li>Delete your account.</li>
          <li>Request data correction.</li>
        </ul>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200  bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">8. Third-Party Integrations</h1>
        <p className="leading-7 ms-7 text-gray-600">
          WorkPilot may integrate with third-party services such as:
        </p>
        <ul className="mb-5 ms-8 list-disc mt-1 space-y-2 pl-6 text-gray-600">
          <li>Google Sign-In</li>
          <li>Microsoft Sign-In</li>
          <li>GitHub</li>
          <li>Slack</li>
          <li>Google Calendar</li>
          <li>Microsoft Outlook</li>
        </ul>
        <p className="leading-7 ms-7 text-gray-600">
          These services are governed by their own privacy policies.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">9. Children&lsquo;s Privacy</h1>
        <p className="leading-7 ms-7 text-gray-600">
          WorkPilot is intended for business and professional use and is not designed for children
          under the age of 13.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">
          10. Changes to This Privacy Policy
        </h1>
        <p className="leading-7 ms-7 text-gray-600">
          We may update this Privacy Policy periodically. Material changes will be communicated
          through the application or by email where appropriate.
        </p>
      </div>
      <hr style={hr} />

      <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl mb-1 font-bold text-gray-900">11. Contact Us</h1>
        <p className="leading-7 ms-9 text-gray-600">
          If you have questions or concerns about this Privacy Policy, please contact:
        </p>
        <div className="ms-9">
          <p>
            <strong>WorkPilot Support</strong>
            <br />
            <strong>Email:</strong>{' '}
            <a href="mailto:support@WorkPilot.com" style={linkStyle}>
              support@WorkPilot.com
            </a>
            <br />
            <strong>Website:</strong>{' '}
            <a
              href="https://www.WorkPilot.com"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              https://www.WorkPilot.com
            </a>
            <br />
            <strong>Business Hours:</strong> Monday – Friday, 9:00 AM – 6:00 PM (IST)
          </p>
        </div>
      </div>
      <hr style={hr} />

      {showActions && (
        <div className="mt-8 flex justify-end">
          <WpButton type="button" size="sm" onClick={handleContinue}>
            Continue
          </WpButton>
        </div>
      )}
    </div>
  );
};
