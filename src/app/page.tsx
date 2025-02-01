'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          PieRat
        </h1>
        <p className="text-xl text-gray-300">
          Star Citizen Piracy Management
        </p>
        <Link
          href="/signin" 
          className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Sign In with Discord
        </Link>
      </div>
    </main>
  );
}
