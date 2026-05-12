'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '@/lib/api/dashboard';
import DashboardClient from './DashboardClient';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { useVaultStore } from '@/store/useVaultStore';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { displayName, setDisplayName } = useVaultStore();
  
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

  useEffect(() => {
    if (!displayName) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('profiles').select('display_name').eq('id', user.id).single()
            .then(({ data }) => {
              if (data?.display_name) setDisplayName(data.display_name);
            });
        }
      });
    }
  }, [supabase, displayName, setDisplayName]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['dashboard', month, year],
    queryFn: () => fetchDashboardData(month, year),
    placeholderData: (prev) => prev,
  });

  if (isLoading && !data) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return <DashboardClient initialData={data} displayName={displayName || 'Utilisateur'} month={month} year={year} />;
}
