// lib/api/transactions.ts
import { createClient } from '@/lib/supabase/client';

// Fonction utilitaire pour parser YYYY-MM-DD sans décalage UTC
function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export async function fetchTransactionsData(month: number, year: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: allTransactionsRaw } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', user.id);

  const allTransactions = allTransactionsRaw || [];

  const targetMonthStartBoundary = new Date(year, month - 1, 1);
  const targetMonthEndBoundary = new Date(year, month, 1);

  const monthlyTransactions: any[] = [];

  for (const tx of allTransactions) {
    const startDate = parseLocalDate(tx.date);
    const endDate = tx.recurrence_end_date ? parseLocalDate(tx.recurrence_end_date) : null;

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
            const dateString = `${potentialInstanceDate.getFullYear()}-${String(potentialInstanceDate.getMonth() + 1).padStart(2, '0')}-${String(potentialInstanceDate.getDate()).padStart(2, '0')}`;
            monthlyTransactions.push({
                ...tx,
                id: `${tx.id}-${dateString}`,
                date: dateString,
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
              const dateString = `${instanceDate.getFullYear()}-${String(instanceDate.getMonth() + 1).padStart(2, '0')}-${String(instanceDate.getDate()).padStart(2, '0')}`;
              monthlyTransactions.push({
                  ...tx,
                  id: `${tx.id}-${dateString}`,
                  date: dateString,
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
