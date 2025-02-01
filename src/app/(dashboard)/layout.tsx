'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: '📊' },
  { name: 'Reports', href: '/dashboard/reports', icon: '📝' },
  { name: 'Crew', href: '/dashboard/crew', icon: '👥' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession({ required: true });
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-black">
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url("/images/background.png")' }}
      />
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-radial from-black/70 via-black/80 to-black/90 z-10" />
      
      {/* Grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] z-20" />

      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-30">
        <div className="flex flex-col flex-grow bg-gray-900/50 backdrop-blur-md border-r border-white/10">
          <div className="flex items-center h-16 px-4 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors duration-200">
              <span className="text-2xl">🏴‍☠️</span>
              <span className="text-xl font-bold text-white">PieRat</span>
            </Link>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                    transition-all duration-200 ease-in-out
                    ${isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/50'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }
                  `}
                >
                  <span className={`mr-3 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 border-t border-white/10 p-4">
            <div className="w-full group">
              <div className="flex items-center px-2 py-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                    View profile
                  </p>
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                  ⚙️
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 relative z-30">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-lg border border-white/10 p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
