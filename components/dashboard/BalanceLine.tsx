// components/dashboard/BalanceLine.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BalanceLineProps {
  data: { date: string; balance: number }[];
}

export default function BalanceLine({ data }: BalanceLineProps) {
  return (
    <Card className="border-[#f472b6]/10 bg-[#1a1122]">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-400">Évolution du solde</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a1a3a" />
            <XAxis 
              dataKey="date" 
              stroke="#888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1122', borderColor: '#f472b620', borderRadius: '12px' }}
              itemStyle={{ color: '#f472b6' }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#f472b6" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#f472b6', strokeWidth: 2, stroke: '#1a1122' }}
              activeDot={{ r: 6, fill: '#f472b6', stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
