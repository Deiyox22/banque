// app/(dashboard)/transactions/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTransactionsData } from '@/lib/api/transactions';
import { TransactionsClient } from './TransactionsClient';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', month, year],
    queryFn: () => fetchTransactionsData(month, year),
    placeholderData: (prev) => prev,
  });

  if (isLoading && !data) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return <TransactionsClient initialTransactions={data || []} month={month} year={year} />;
}
