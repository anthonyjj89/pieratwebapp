import { Metadata } from 'next';
import SignInForm from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In - PieRat',
  description: 'Sign in to your PieRat account using Discord',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome to PieRat</h1>
          <p className="mt-2 text-gray-400">
            Sign in with Discord to access your organization&apos;s dashboard
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
