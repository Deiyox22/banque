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
    console.log(`Processing tx: ${tx.label}, type: ${tx.recurrence_type}, date: ${tx.date}`);
    const startDate = new Date(tx.date);
    const endDate = tx.recurrence_end_date ? new Date(tx.recurrence_end_date) : null;

    const isRecurring = !!tx.recurrence_type;
    console.log(`Tx ${tx.label} isRecurring: ${isRecurring}`);

    if (!isRecurring) {
      // --- Non-recurring transactions ---
      // Filter these based on whether their date falls within the target month/year.
      if (startDate >= targetMonthStartBoundary && startDate < targetMonthEndBoundary) {
        console.log(`Including non-recurring tx: ${tx.label}`);
        monthlyTransactions.push(tx);
      }
    } else {
      // --- Recurring transactions ---
      // We need to generate instances of recurring transactions that fall within the target month.

      const originalDayOfMonth = startDate.getDate(); // The day of the month the recurrence started on

      if (tx.recurrence_type === 'monthly') {
        // --- Monthly recurrence ---
        // Construct the potential date for this recurring transaction in the target month.
        // Adding a slight offset or ensuring UTC alignment might be needed.
        // Using UTC date methods can often avoid timezone-related shifts.
        let potentialInstanceDate = new Date(Date.UTC(year, month - 1, originalDayOfMonth));
        
        // Handle day overflow:
        const daysInTargetMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
        if (originalDayOfMonth > daysInTargetMonth) {
            potentialInstanceDate.setUTCDate(daysInTargetMonth);
        }
        
        // Normalize time:
        potentialInstanceDate.setUTCHours(0, 0, 0, 0);

        // Check if this generated date is valid:
        const startDateUTC = new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000);
        const targetMonthEndBoundaryUTC = new Date(Date.UTC(year, month, 1));
        
        console.log(`Checking instance for ${tx.label}: ${potentialInstanceDate.toISOString().split('T')[0]}, Start: ${startDateUTC.toISOString().split('T')[0]}, EndBoundary: ${targetMonthEndBoundaryUTC.toISOString().split('T')[0]}`);
        
        if (potentialInstanceDate >= startDateUTC &&
            potentialInstanceDate < targetMonthEndBoundaryUTC &&
            (!endDate || potentialInstanceDate <= endDate)
           ) {
            console.log(`Including generated monthly instance: ${tx.label}, date: ${potentialInstanceDate.toISOString().split('T')[0]}`);
            
            const instance = {
                ...tx,
                id: `${tx.id}-${potentialInstanceDate.toISOString().split('T')[0]}`,
                date: potentialInstanceDate.toISOString().split('T')[0],
            };
            monthlyTransactions.push(instance);
        }
      } else if (tx.recurrence_type === 'yearly') {
          // --- Yearly recurrence ---
          // Check if the target month and year align with the yearly recurrence pattern.
          // The instance date should conceptually be the same month and day as the original start date, but in the target year.
          const instanceDate = new Date(startDate); // Start with the original transaction date
          instanceDate.setFullYear(year); // Set the year to the target year
          instanceDate.setMonth(month - 1); // Set the month to the target month

          // Handle day overflow similar to monthly recurrence for consistency.
          const daysInTargetMonth = new Date(year, month, 0).getDate();
          if (instanceDate.getDate() > daysInTargetMonth) {
              instanceDate.setDate(daysInTargetMonth);
          }

          // Normalize time.
          instanceDate.setHours(0, 0, 0, 0);
          
          // Check if this yearly instance date falls within the target month and respects recurrence rules.
          if (instanceDate >= startDate && // Must be on or after the transaction's absolute start date.
              instanceDate < targetMonthEndBoundary && // Must fall within the target month.
              (!endDate || instanceDate <= endDate) // Must be on or before the recurrence end date.
             ) {
              const instance = {
                  ...tx,
                  id: `${tx.id}-${instanceDate.toISOString().split('T')[0]}`,
                  date: instanceDate.toISOString().split('T')[0],
              };
              monthlyTransactions.push(instance);
          }
      } else {
          // --- Daily, Weekly, or other/unspecified recurrence types ---
          // For these types, we won't generate specific instances per day/week for this fix,
          // as the prompt focuses on monthly transactions. Instead, we apply the original filtering logic:
          // if the recurring definition itself spans the target month, include the original transaction object.
          // This ensures that these recurring definitions are considered if they are active during the month,
          // without complex generation logic for non-monthly types.
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
