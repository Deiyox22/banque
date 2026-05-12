// lib/api/dashboard.ts
import { createClient } from '@/lib/supabase/client';

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export async function fetchDashboardData(month: number, year: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: allTransactionsRaw } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', user.id);

  const { data: goals } = await supabase
    .from('savings_goals')
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
        if (originalDayOfMonth > daysInTargetMonth) potentialInstanceDate.setDate(daysInTargetMonth);
        potentialInstanceDate.setHours(0, 0, 0, 0);

        if (potentialInstanceDate >= startDate && potentialInstanceDate < targetMonthEndBoundary && (!endDate || potentialInstanceDate <= endDate)) {
          monthlyTransactions.push({ ...tx, id: `${tx.id}-${potentialInstanceDate.toISOString().split('T')[0]}`, date: potentialInstanceDate.toISOString().split('T')[0] });
        }
      } else if (tx.recurrence_type === 'yearly') {
        const instanceDate = new Date(startDate);
        instanceDate.setFullYear(year);
        instanceDate.setMonth(month - 1);
        const daysInTargetMonth = new Date(year, month, 0).getDate();
        if (instanceDate.getDate() > daysInTargetMonth) instanceDate.setDate(daysInTargetMonth);
        instanceDate.setHours(0, 0, 0, 0);

        if (instanceDate >= startDate && instanceDate < targetMonthEndBoundary && (!endDate || instanceDate <= endDate)) {
          monthlyTransactions.push({ ...tx, id: `${tx.id}-${instanceDate.toISOString().split('T')[0]}`, date: instanceDate.toISOString().split('T')[0] });
        }
      } else {
        if (startDate < targetMonthEndBoundary && (!endDate || endDate >= targetMonthStartBoundary)) {
          monthlyTransactions.push(tx);
        }
      }
    }
  }

  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const balance = totalIncome - totalExpense;
  const totalSavings = goals?.reduce((acc, g) => acc + Number(g.current_amount), 0) || 0;

  return { transactions: monthlyTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), totalIncome, totalExpense, balance, totalSavings };
}
