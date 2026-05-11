// app/(dashboard)/layout.tsx
import Sidebar from '@/components/shared/Sidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TransactionModal from '@/components/shared/TransactionModal';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden bg-background">
      <Sidebar />
      <div className="flex-1 w-full md:pl-20 transition-all">
        <div className="mx-auto max-w-7xl p-4 pb-24 md:p-8 md:pb-8 w-full">
          {children}
        </div>
      </div>
      <TransactionModal mode="fab" />
    </div>
  );
}
