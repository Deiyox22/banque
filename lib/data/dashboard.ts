import { createClient } from '@/lib/supabase/server';

// Assuming a Transaction type is defined elsewhere, e.g., in lib/validations/schemas.ts
// For the purpose of this implementation, we infer the structure from usage.
// interface Transaction {
//   id: string;
//   owner_id: string;
//   date: string; // 'YYYY-MM-DD'
//   amount: string; // Stored as string for precision, convert to number for calculations
//   type: 'income' | 'expense';
//   is_recurring: boolean;
//   recurrence_type?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
//   recurrence_end_date?: string | null; // 'YYYY-MM-DD'
//   // other fields...
// }

// Fonction utilitaire pour parser YYYY-MM-DD sans décalage UTC
function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export async function getDashboardData(userId: string, month: number, year: number) {
  const supabase = createClient();

  // Fetch ALL transactions for the user, irrespective of the dashboard's month/year.
  // This is crucial for recurring transactions that span across months.
  const { data: allTransactionsRaw } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', userId);

  const allTransactions = allTransactionsRaw || [];

  // Define the date boundaries for the target month (0-indexed month for JavaScript Date object)
  const targetMonthStartBoundary = new Date(year, month - 1, 1);
  const targetMonthEndBoundary = new Date(year, month, 1); // This is the start of the NEXT month

  const monthlyTransactions: any[] = []; // Array to hold transactions for the current dashboard view

  for (const tx of allTransactions) {
    const startDate = parseLocalDate(tx.date);
    const endDate = tx.recurrence_end_date ? parseLocalDate(tx.recurrence_end_date) : null;

    const isRecurring = !!tx.recurrence_type;

    if (!isRecurring) {
      // --- Non-recurring transactions ---
      // Filter these based on whether their date falls within the target month/year.
      if (startDate >= targetMonthStartBoundary && startDate < targetMonthEndBoundary) {
        monthlyTransactions.push(tx);
      }
    } else {
      // --- Recurring transactions ---
      // We need to generate instances of recurring transactions that fall within the target month.

      const originalDayOfMonth = startDate.getDate(); // The day of the month the recurrence started on

      if (tx.recurrence_type === 'monthly') {
        // --- Monthly recurrence ---
        let potentialInstanceDate = new Date(year, month - 1, originalDayOfMonth);
        
        // Handle day overflow:
        const daysInTargetMonth = new Date(year, month, 0).getDate();
        if (originalDayOfMonth > daysInTargetMonth) {
            potentialInstanceDate.setDate(daysInTargetMonth);
        }
        
        // Normalize time:
        potentialInstanceDate.setHours(0, 0, 0, 0);

        // Check if this generated date is valid:
        if (potentialInstanceDate >= startDate &&
            potentialInstanceDate < targetMonthEndBoundary &&
            (!endDate || potentialInstanceDate <= endDate)
           ) {
            const dateString = `${potentialInstanceDate.getFullYear()}-${String(potentialInstanceDate.getMonth() + 1).padStart(2, '0')}-${String(potentialInstanceDate.getDate()).padStart(2, '0')}`;
            const instance = {
                ...tx,
                id: `${tx.id}-${dateString}`,
                date: dateString,
            };
            monthlyTransactions.push(instance);
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
          const dateString = `${instanceDate.getFullYear()}-${String(instanceDate.getMonth() + 1).padStart(2, '0')}-${String(instanceDate.getDate()).padStart(2, '0')}`;
          
          if (instanceDate >= startDate &&
              instanceDate < targetMonthEndBoundary &&
              (!endDate || instanceDate <= endDate)
             ) {
              const instance = {
                  ...tx,
                  id: `${tx.id}-${dateString}`,
                  date: dateString,
              };
              monthlyTransactions.push(instance);
          }
      } else {
          // --- Daily, Weekly, or other/unspecified recurrence types ---
          if (startDate < targetMonthEndBoundary && (!endDate || endDate >= targetMonthStartBoundary)) {
              monthlyTransactions.push(tx);
          }
      }
    }
  }

  // --- Calculate totals based on the combined list of transactions (original + generated instances) ---
  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const balance = totalIncome - totalExpense;
  
  // --- Fetch savings goals separately ---
  // Goals are not affected by the recurrence logic of transactions.
  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('owner_id', userId);
  const totalSavings = goals?.reduce((acc, g) => acc + Number(g.current_amount), 0) || 0;

  return {
    transactions: monthlyTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    totalIncome,
    totalExpense,
    balance,
    totalSavings,
  };
}
