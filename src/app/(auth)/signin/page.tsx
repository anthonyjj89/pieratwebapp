import { Suspense } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import Image from 'next/image';

function LoadingButton() {
  return (
    <button
      disabled
      className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 opacity-50 cursor-not-allowed"
    >
      <Image
        src="/discord-mark-white.svg"
        alt="Discord"
        width={24}
        height={24}
      />
      <span className="animate-pulse">Loading...</span>
    </button>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome to PieRat
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in with Discord to continue
          </p>
        </div>

        <Suspense fallback={<LoadingButton />}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
