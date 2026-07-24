import { SignInTemplate } from '@/src/modules/signin/templates';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - WorkPilot',
  description: 'Sign in to your WorkPilot workspace',
};

export default function SignInPage() {
  return <SignInTemplate />;
}
