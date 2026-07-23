import React from 'react';
import { colors } from '@/src/styles/colors';

const hr = {
  margin: '32px 0',
  border: 'none',
  borderTop: `1px solid ${colors.borderLight}`,
} as const;
const linkStyle = { color: colors.primaryFocus } as const;

export const PrivacyPolicy = () => {
  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        color: colors.textBody,
      }}
    >
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ color: colors.textMuted, marginBottom: '32px' }}>
        <strong>Last Updated:</strong> July 2026
      </p>

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        Introduction
      </h2>
      <p>
        At <strong>WorkPilot</strong>, we respect your privacy and are committed to protecting your
        personal information.
      </p>
      <p>
        This Privacy Policy explains how we collect, use, store, and protect your data when you use
        our services.
      </p>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        1. Information We Collect
      </h2>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>
        Personal Information
      </h3>
      <p>We may collect:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li>Full Name</li>
        <li>Email Address</li>
        <li>Company Name</li>
        <li>Job Title</li>
        <li>Profile Picture</li>
      </ul>

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>
        Workspace Information
      </h3>
      <p>We store information necessary to provide our services, including:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
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

      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '24px', marginBottom: '12px' }}>
        Technical Information
      </h3>
      <p>We may collect:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li>IP Address</li>
        <li>Browser Type</li>
        <li>Device Information</li>
        <li>Operating System</li>
        <li>Login Activity</li>
        <li>Usage Analytics</li>
      </ul>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        2. How We Use Your Information
      </h2>
      <p>We use your information to:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li>Create and manage your account.</li>
        <li>Authenticate users securely.</li>
        <li>Provide project management features.</li>
        <li>Enable collaboration within workspaces.</li>
        <li>Improve application performance.</li>
        <li>Send important notifications.</li>
        <li>Provide technical support.</li>
      </ul>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        3. Cookies
      </h2>
      <p>WorkPilot uses cookies and similar technologies to:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li>Keep you signed in.</li>
        <li>Remember your preferences.</li>
        <li>Improve application performance.</li>
        <li>Enhance your overall user experience.</li>
      </ul>
      <p>
        You can manage or disable cookies through your browser settings, though some features may
        not function correctly.
      </p>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        4. Data Security
      </h2>
      <p>We use industry-standard security measures, including:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li>HTTPS encryption</li>
        <li>Password hashing</li>
        <li>Secure authentication</li>
        <li>Role-based access control</li>
        <li>Continuous security monitoring</li>
      </ul>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        5. Data Sharing
      </h2>
      <p>
        We do <strong>not sell</strong> your personal information.
      </p>
      <p>Information may only be shared:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li>With trusted service providers supporting our platform.</li>
        <li>When required by law.</li>
        <li>To protect our legal rights.</li>
        <li>With your explicit consent.</li>
      </ul>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        6. Data Retention
      </h2>
      <p>Your data is retained only for as long as necessary to:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li>Deliver our services.</li>
        <li>Meet legal obligations.</li>
        <li>Resolve disputes.</li>
        <li>Enforce our agreements.</li>
      </ul>
      <p>
        You may request deletion of your account, subject to applicable legal and contractual
        requirements.
      </p>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        7. Your Rights
      </h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li>Access your personal information.</li>
        <li>Update or correct your information.</li>
        <li>Export your data.</li>
        <li>Delete your account.</li>
        <li>Request data correction.</li>
      </ul>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        8. Third-Party Integrations
      </h2>
      <p>WorkPilot may integrate with third-party services such as:</p>
      <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
        <li>Google Sign-In</li>
        <li>Microsoft Sign-In</li>
        <li>GitHub</li>
        <li>Slack</li>
        <li>Google Calendar</li>
        <li>Microsoft Outlook</li>
      </ul>
      <p>These services are governed by their own privacy policies.</p>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        9. Children&lsquo;s Privacy
      </h2>
      <p>
        WorkPilot is intended for business and professional use and is not designed for children
        under the age of 13.
      </p>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        10. Changes to This Privacy Policy
      </h2>
      <p>
        We may update this Privacy Policy periodically. Material changes will be communicated
        through the application or by email where appropriate.
      </p>
      <hr style={hr} />

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>
        11. Contact Us
      </h2>
      <p>If you have questions or concerns about this Privacy Policy, please contact:</p>
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
  );
};
