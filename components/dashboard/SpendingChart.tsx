'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/* Palette de couleurs */
const CATEGORY_COLORS = ['#fb7185', '#fda4af', '#fecaca', '#fca5a5', '#f87171'];

export default function SpendingChart({ transactions }: { transactions: any[] }) {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  
  // Regrouper les dépenses par catégorie
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'Général';
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const totalExpense = (Object.values(expensesByCategory) as number[]).reduce((sum, val) => sum + val, 0);

  // Préparer les données pour le graphique
  const data = (Object.entries(expensesByCategory) as [string, number][]).map(([name, value]) => ({
    name,
    value,
    percentage: totalIncome > 0 ? ((value / totalIncome) * 100).toFixed(1) : 0
  }));

  // Ajouter la part restante (Revenu non dépensé)
  const remaining = Math.max(0, totalIncome - totalExpense);
  if (remaining > 0) {
    data.push({ name: 'Disponible', value: remaining, percentage: ((remaining / totalIncome) * 100).toFixed(1) });
  }

  if (totalIncome === 0) return <div className="h-48 flex items-center justify-center text-muted-foreground text-sm italic">Aucun revenu pour comparer.</div>;

  return (
    <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={220}>
        <PieChart>
            <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === 'Disponible' ? '#10b981' : CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
            ))}
            </Pie>
            <Tooltip 
                formatter={(value: number, name: string, props: any) => [`${value.toFixed(0)}€ (${props.payload.percentage}%)`, name]}
            />
        </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-muted-foreground mt-2 w-full">
            {data.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 truncate">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.name === 'Disponible' ? '#10b981' : CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}></div>
                    <span className="truncate">{item.name}: {item.percentage}%</span>
                </div>
            ))}
        </div>
    </div>
  );
}
