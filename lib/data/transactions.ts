import { createClient } from '@/lib/supabase/server';

export async function getTransactionsData(userId: string, month: number, year: number) {
  const supabase = createClient();

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = month === 12 
    ? `${year + 1}-01-01` 
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', userId);

  return rawTransactions?.filter(tx => {
    if (!tx.is_recurring) {
      const txDate = new Date(tx.date);
      return txDate >= new Date(firstDay) && txDate < new Date(lastDay);
    }
    const startDate = new Date(tx.date);
    const endDate = tx.recurrence_end_date ? new Date(tx.recurrence_end_date) : null;
    return startDate < new Date(lastDay) && (!endDate || endDate >= new Date(firstDay));
  }) || [];
}
