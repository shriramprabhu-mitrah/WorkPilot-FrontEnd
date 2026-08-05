import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react';

interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

interface PasswordStrengthResult {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  checks: PasswordChecks;
}

interface PasswordStrengthProps {
  password: string;
  show: boolean;
}

const PASSWORD_REQUIREMENTS = [
  {
    key: 'length',
    text: 'Have at least 8 characters',
  },
  {
    key: 'uppercase',
    text: 'Have one uppercase letter',
  },
  {
    key: 'lowercase',
    text: 'Have one lowercase letter',
  },
  {
    key: 'number',
    text: 'Have one number',
  },
  {
    key: 'special',
    text: 'Have one special character',
  },
] as const;

const getPasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  Object.values(checks).forEach((check) => {
    if (check) score++;
  });

  let label: PasswordStrengthResult['label'] = 'Weak';
  let color = 'bg-red-500';

  if (score === 2 || score === 3) {
    label = 'Fair';
    color = 'bg-yellow-500';
  } else if (score === 4) {
    label = 'Good';
    color = 'bg-blue-500';
  } else if (score === 5) {
    label = 'Strong';
    color = 'bg-green-500';
  }

  return {
    score,
    label,
    color,
    checks,
  };
};

export const PasswordStrength = ({ password, show }: PasswordStrengthProps) => {
  if (!show || !password) return null;

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-xl">
      <div className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 border-l border-t border-gray-200 bg-white" />

      <div className="p-3">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-600" />
          <span className="text-sm font-semibold text-gray-800">Password must</span>
        </div>

        <div className="space-y-2">
          {PASSWORD_REQUIREMENTS.map((item) => (
            <div
              key={item.key}
              className={`flex items-center gap-2 text-xs ${
                passwordStrength.checks[item.key] ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {passwordStrength.checks[item.key] ? (
                <CheckCircle2 size={14} />
              ) : (
                <Circle size={14} />
              )}

              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <div className="mb-2 flex justify-between">
            <span className="text-[11px] text-gray-500">Password Strength</span>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                passwordStrength.label === 'Strong'
                  ? 'bg-green-100 text-green-700'
                  : passwordStrength.label === 'Good'
                    ? 'bg-blue-100 text-blue-700'
                    : passwordStrength.label === 'Fair'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
              }`}
            >
              {passwordStrength.label}
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`${passwordStrength.color} h-full transition-all duration-300`}
              style={{
                width: `${passwordStrength.score * 20}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
