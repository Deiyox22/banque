// app/(dashboard)/layout.tsx
import Sidebar from '@/components/shared/Sidebar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

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
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <Sidebar />
      <div className="flex-1 md:pl-20 transition-all">
        <div className="mx-auto max-w-7xl p-4 pb-24 md:p-8 md:pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
