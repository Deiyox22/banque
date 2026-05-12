// app/(dashboard)/layout.tsx
import Sidebar from '@/components/shared/Sidebar';
import AuthGuard from '@/components/shared/AuthGuard';
import TransactionModal from '@/components/shared/TransactionModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-screen overflow-x-hidden bg-background">
        <Sidebar />
        <div className="flex-1 w-full md:pl-20 transition-all">
          <div className="mx-auto max-w-7xl p-4 pb-24 md:p-8 md:pb-8 w-full">
            {children}
          </div>
        </div>
        <TransactionModal mode="fab" />
      </div>
    </AuthGuard>
  );
}
