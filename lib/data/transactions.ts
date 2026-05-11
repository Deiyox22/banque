import { createClient } from '@/lib/supabase/server';

export async function getTransactionsData(userId: string, month: number, year: number) {
  const supabase = createClient();

  const { data: allTransactionsRaw } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', userId);

  const allTransactions = allTransactionsRaw || [];

  const targetMonthStartBoundary = new Date(year, month - 1, 1);
  const targetMonthEndBoundary = new Date(year, month, 1);

  const monthlyTransactions: any[] = [];

  for (const tx of allTransactions) {
    const startDate = new Date(tx.date);
    const endDate = tx.recurrence_end_date ? new Date(tx.recurrence_end_date) : null;

    const isRecurring = !!tx.recurrence_type;

    if (!isRecurring) {
      if (startDate >= targetMonthStartBoundary && startDate < targetMonthEndBoundary) {
        monthlyTransactions.push(tx);
      }
    } else {
      const originalDayOfMonth = startDate.getDate();

      if (tx.recurrence_type === 'monthly') {
        let potentialInstanceDate = new Date(year, month - 1, originalDayOfMonth);
        const daysInTargetMonth = new Date(year, month, 0).getDate();
        if (originalDayOfMonth > daysInTargetMonth) {
          potentialInstanceDate.setDate(daysInTargetMonth);
        }
        
        potentialInstanceDate.setHours(0, 0, 0, 0);

        if (potentialInstanceDate >= startDate &&
            potentialInstanceDate < targetMonthEndBoundary &&
            (!endDate || potentialInstanceDate <= endDate)
           ) {
            monthlyTransactions.push({
                ...tx,
                id: `${tx.id}-${potentialInstanceDate.toISOString().split('T')[0]}`,
                date: potentialInstanceDate.toISOString().split('T')[0],
            });
        }
      } else if (tx.recurrence_type === 'yearly') {
          const instanceDate = new Date(startDate);
          instanceDate.setFullYear(year);
          instanceDate.setMonth(month - 1);

          const daysInTargetMonth = new Date(year, month, 0).getDate();
          if (instanceDate.getDate() > daysInTargetMonth) {
              instanceDate.setDate(daysInTargetMonth);
          }

          instanceDate.setHours(0, 0, 0, 0);
          
          if (instanceDate >= startDate &&
              instanceDate < targetMonthEndBoundary &&
              (!endDate || instanceDate <= endDate)
             ) {
              monthlyTransactions.push({
                  ...tx,
                  id: `${tx.id}-${instanceDate.toISOString().split('T')[0]}`,
                  date: instanceDate.toISOString().split('T')[0],
              });
          }
      } else {
          if (startDate < targetMonthEndBoundary && (!endDate || endDate >= targetMonthStartBoundary)) {
              monthlyTransactions.push(tx);
          }
      }
    }
  }

  return monthlyTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
