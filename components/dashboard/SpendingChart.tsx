'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#f472b6', '#c084fc', '#6366f1', '#38bdf8', '#34d399', '#fbbf24', '#f87171'];

export default function SpendingChart({ transactions }: { transactions: any[] }) {
  // Calculer les données par catégorie
  const expenseData = transactions
    .reduce((acc, t) => {
      const category = t.category || 'Autres';
      acc[category] = (acc[category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const data: { name: string, value: number }[] = Object.entries(expenseData).map(([name, value]) => ({ 
      name, 
      value: value as number 
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) return <div className="h-48 flex items-center justify-center text-gray-500 text-sm italic">Pas assez de données pour le graphique.</div>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={50}
          outerRadius={70}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip 
            formatter={(value: number) => [`${value.toFixed(2)} €`, 'Montant']}
            contentStyle={{ backgroundColor: '#1a1122', border: '1px solid #f472b6/20', borderRadius: '12px' }}
            itemStyle={{ color: '#fff' }}
        />
        <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            iconSize={8}
            formatter={(value, entry: any) => {
                const percent = ((entry.payload.value / total) * 100).toFixed(1);
                return (
                    <span className="text-[10px] text-gray-300 ml-1">
                        {value} : <span className="font-bold">{entry.payload.value.toFixed(0)}€ ({percent}%)</span>
                    </span>
                );
            }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
