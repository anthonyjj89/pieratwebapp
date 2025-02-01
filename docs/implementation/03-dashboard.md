# Dashboard Implementation Guide

## Overview
This guide details the implementation of the dashboard interface and core features including hit reporting, crew management, and profit tracking.

## Prerequisites
- Authentication system from [01-auth-setup.md](./01-auth-setup.md)
- Organization system from [02-org-system.md](./02-org-system.md)

## Steps

### 1. Dashboard Layout
Create `src/app/(dashboard)/layout.tsx`:
```typescript
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
```

### 2. Navigation Components
Create `src/components/dashboard/Sidebar.tsx`:
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Reports', href: '/dashboard/reports', icon: DocumentIcon },
  { name: 'Crew', href: '/dashboard/crew', icon: UsersIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-gray-900 pt-5 pb-4">
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-xl font-bold text-white">PieRat</span>
        </div>
        <nav className="mt-5 flex-1 flex flex-col divide-y divide-gray-800 overflow-y-auto">
          <div className="px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  pathname === item.href
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-6 w-6"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
```

### 3. Hit Report System
Create `src/models/Report.ts`:
```typescript
import { ObjectId } from 'mongodb';

export interface Report {
  _id: ObjectId;
  organizationId: ObjectId;
  createdBy: string; // Discord user ID
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'submitted' | 'verified' | 'completed';
  target: {
    name: string;
    ship: string;
    location: string;
  };
  crew: Array<{
    userId: string;
    role: string;
    share: number;
  }>;
  loot: Array<{
    type: string;
    amount: number;
    value: number;
  }>;
  evidence: Array<{
    type: 'image' | 'video';
    url: string;
    description: string;
  }>;
  notes: string;
}
```

### 4. Report Creation Form
Create `src/app/dashboard/reports/new/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewReportPage() {
  const router = useRouter();
  const { data: session } = useSession({ required: true });
  const [formData, setFormData] = useState({
    target: {
      name: '',
      ship: '',
      location: '',
    },
    crew: [],
    loot: [],
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const report = await response.json();
      router.push(`/dashboard/reports/${report._id}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Hit Report</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Target Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Target Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Target Name
              </label>
              <input
                type="text"
                value={formData.target.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target: { ...formData.target, name: e.target.value },
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>
            {/* Add other target fields */}
          </div>
        </div>

        {/* Crew Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Crew</h2>
          {/* Add crew member UI */}
        </div>

        {/* Loot Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Loot</h2>
          {/* Add loot items UI */}
        </div>

        {/* Notes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 5. Report List View
Create `src/app/dashboard/reports/page.tsx`:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import Link from 'next/link';

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const client = await clientPromise;
  const db = client.db();

  // Get user's organization
  const member = await db.collection('organization_members').findOne({
    userId: session.user.id,
    status: 'active',
  });

  // Get reports for the organization
  const reports = await db
    .collection('reports')
    .find({ organizationId: member.organizationId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hit Reports</h1>
        <Link
          href="/dashboard/reports/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          New Report
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {reports.map((report) => (
            <li key={report._id.toString()}>
              <Link
                href={`/dashboard/reports/${report._id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {report.target.name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {report.status}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### 6. Analytics Dashboard
Create `src/app/dashboard/analytics/page.tsx`:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  const client = await clientPromise;
  const db = client.db();

  // Get user's organization
  const member = await db.collection('organization_members').findOne({
    userId: session.user.id,
    status: 'active',
  });

  // Get analytics data
  const totalReports = await db
    .collection('reports')
    .countDocuments({ organizationId: member.organizationId });

  const recentReports = await db
    .collection('reports')
    .find({ organizationId: member.organizationId })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  const totalLoot = await db
    .collection('reports')
    .aggregate([
      { $match: { organizationId: member.organizationId } },
      { $unwind: '$loot' },
      { $group: { _id: null, total: { $sum: '$loot.value' } } },
    ])
    .toArray();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats Cards */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Reports
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalReports}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Loot Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalLoot[0]?.total.toLocaleString()} aUEC
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Add recent activity list */}
        </div>
      </div>
    </div>
  );
}
```

### 7. Testing
1. Test dashboard navigation:
   - All routes accessible
   - Proper active state highlighting
   - Mobile responsiveness
2. Test report creation:
   - Form validation
   - File uploads
   - Success/error handling
3. Test analytics:
   - Data accuracy
   - Performance with large datasets
   - Chart interactions

### Next Steps
1. Add report approval workflow
2. Implement file upload for evidence
3. Add real-time updates
4. Enhance analytics with charts
5. Add export functionality
