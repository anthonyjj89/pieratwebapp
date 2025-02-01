import Sidebar from '@/components/dashboard/Sidebar';
import DashboardWrapper from '@/components/dashboard/DashboardWrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardWrapper>
      <div>
        <Sidebar />
        <div className="lg:pl-64">
          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </DashboardWrapper>
  );
}

//comment 
