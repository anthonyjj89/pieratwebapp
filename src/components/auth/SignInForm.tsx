'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

export function SignInForm() {
  return (
    <button
      onClick={() => {
        console.log('Starting Discord auth...');
        signIn('discord', { 
          callbackUrl: '/dashboard',
          redirect: false 
        }).then(result => {
          console.log('Auth result:', result);
        }).catch(error => {
          console.error('Auth error:', error);
        });
      }}
      className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
    >
      <Image
        src="/discord-mark-white.svg"
        alt="Discord"
        width={24}
        height={24}
      />
      Sign in with Discord
    </button>
  );
}
