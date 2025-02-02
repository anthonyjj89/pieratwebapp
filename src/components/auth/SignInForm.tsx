'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function SignInForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Discord auth...', { callbackUrl });
      
      const result = await signIn('discord', { 
        callbackUrl,
        redirect: false
      });

      console.log('Auth result:', result);

      if (result?.error) {
        console.error('Auth error:', result.error);
        // Handle error (could add toast notification here)
      } else if (result?.url) {
        // Use window.location for hard redirect to handle OAuth flow
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Image
        src="/discord-mark-white.svg"
        alt="Discord"
        width={24}
        height={24}
      />
      {isLoading ? 'Signing in...' : 'Sign in with Discord'}
    </button>
  );
}
