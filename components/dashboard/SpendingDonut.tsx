// components/dashboard/SpendingDonut.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpendingDonutProps {
  data: { name: string; value: number; color: string }[];
}

export default function SpendingDonut({ data }: SpendingDonutProps) {
  return (
    <Card className="rounded-3xl border-none shadow-soft bg-white/50 backdrop-blur-sm overflow-hidden transition-all hover:shadow-glow/10">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">Dépenses par catégorie</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] p-6 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '12px 20px' }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
              cursor={{ fill: 'transparent' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '600' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
