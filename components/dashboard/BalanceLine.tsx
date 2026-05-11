// components/dashboard/BalanceLine.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BalanceLineProps {
  data: { date: string; balance: number }[];
}

export default function BalanceLine({ data }: BalanceLineProps) {
  return (
    <Card className="rounded-3xl border-none shadow-soft bg-white/50 backdrop-blur-sm overflow-hidden transition-all hover:shadow-glow/10">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-sm font-black text-muted-foreground uppercase tracking-widest">Évolution du solde</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] p-6 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="8 8" stroke="hsl(var(--primary)/0.1)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11} 
              fontWeight={600}
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11} 
              fontWeight={600}
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '10px 15px' }}
              itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              strokeWidth={5} 
              dot={{ r: 0 }}
              activeDot={{ r: 8, fill: 'hsl(var(--primary))', stroke: '#fff', strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
