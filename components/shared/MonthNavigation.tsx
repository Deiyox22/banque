'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function MonthNavigation({ 
  month, 
  year, 
  monthName, 
  baseUrl = '/' 
}: { 
  month: number, 
  year: number, 
  monthName: string,
  baseUrl?: string 
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNavigate = (newMonth: number, newYear: number) => {
    startTransition(() => {
      router.push(`${baseUrl}?month=${newMonth}&year=${newYear}`);
    });
  };

  const now = new Date();
  const handleToday = () => {
    handleNavigate(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <div className={cn("flex items-center gap-1 transition-opacity", isPending && "opacity-50 pointer-events-none")}>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 px-2 text-[10px] uppercase font-black text-primary/60 hover:text-primary mr-2" 
        onClick={handleToday}
      >
        Mois actuel
      </Button>

      <Button variant="ghost" size="icon" onClick={() => handleNavigate(month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year)}>
        <ChevronLeft size={20} />
      </Button>
      
      <span className="text-lg font-black capitalize text-primary tracking-tight min-w-[120px] text-center">{monthName}</span>
      
      <Button variant="ghost" size="icon" onClick={() => handleNavigate(month === 12 ? 1 : month + 1, month === 12 ? year + 1 : year)}>
        <ChevronRight size={20} />
      </Button>
    </div>
  );
}
