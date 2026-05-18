import { createClient } from '@/lib/supabase/server';

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  // Retourne une date à minuit UTC, mais qui sera manipulée uniquement via ses composants pour éviter les décalages.
  return new Date(Date.UTC(year, month - 1, day));
}

export async function getTransactionsData(userId: string, month: number, year: number) {
  const supabase = createClient();

  const { data: allTransactionsRaw } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', userId);

  const allTransactions = allTransactionsRaw || [];

  // Define the date boundaries for the target month (Local date)
  // Utilisation de chaînes YYYY-MM-DD pour les comparaisons afin d'éviter les décalages UTC
  const targetStartStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const targetEndStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  
  // Requis pour la logique de récurrence
  const targetMonthStartBoundary = new Date(year, month - 1, 1);
  const targetMonthEndBoundary = new Date(year, month, 1);

  const monthlyTransactions: any[] = [];

  for (const tx of allTransactions) {
    // tx.date est au format YYYY-MM-DD
    const txDate = tx.date;
    
    // Pour la récurrence, on utilise la logique locale déjà corrigée
    const startDate = parseLocalDate(tx.date);
    const endDate = tx.recurrence_end_date ? parseLocalDate(tx.recurrence_end_date) : null;
    const isRecurring = !!tx.recurrence_type;

    if (!isRecurring) {
      if (txDate >= targetStartStr && txDate < targetEndStr) {
        monthlyTransactions.push(tx);
      }
    } else {
      // ... (logique de récurrence)
      const originalDayOfMonth = startDate.getDate();

      if (tx.recurrence_type === 'monthly') {
        const potentialDate = new Date(year, month - 1, originalDayOfMonth);
        
        const daysInTargetMonth = new Date(year, month, 0).getDate();
        const finalDay = Math.min(originalDayOfMonth, daysInTargetMonth);
        const finalDate = new Date(year, month - 1, finalDay);

        const dateString = `${finalDate.getFullYear()}-${String(finalDate.getMonth() + 1).padStart(2, '0')}-${String(finalDate.getDate()).padStart(2, '0')}`;

        if (finalDate >= startDate &&
            finalDate < targetMonthEndBoundary &&
            (!endDate || finalDate <= endDate)
           ) {
            monthlyTransactions.push({
                ...tx,
                id: `${tx.id}-${dateString}`,
                date: dateString,
            });
        }
      } else if (tx.recurrence_type === 'yearly') {
          const instanceDate = new Date(startDate.getFullYear(), month - 1, originalDayOfMonth);

          const daysInTargetMonth = new Date(year, month, 0).getDate();
          if (instanceDate.getDate() > daysInTargetMonth) {
              instanceDate.setDate(daysInTargetMonth);
          }

          const dateString = `${instanceDate.getFullYear()}-${String(instanceDate.getMonth() + 1).padStart(2, '0')}-${String(instanceDate.getDate()).padStart(2, '0')}`;

          if (instanceDate >= startDate &&
              instanceDate < targetMonthEndBoundary &&
              (!endDate || instanceDate <= endDate)
             ) {
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
