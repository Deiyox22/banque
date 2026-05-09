// app/(dashboard)/children/new/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { childAccountSchema } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createChildAccount } from '@/lib/actions/children';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewChildPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(childAccountSchema),
    defaultValues: {
      avatar_color: '#f472b6',
    }
  });

  const onSubmit = async (data: any) => {
    const result = await createChildAccount(data);
    if (result?.error) {
      alert('Erreur lors de la création');
    } else {
      router.push('/children');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href="/children" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#f472b6]">
        <ArrowLeft size={16} />
        Retour à la liste
      </Link>

      <Card className="border-[#f472b6]/10 bg-[#1a1122]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Nouveau compte enfant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Nom de l'enfant</Label>
              <Input {...register('name')} placeholder="Ex: Léo" className="bg-black/20" />
              {errors.name && <span className="text-xs text-rose-500">{errors.name.message as string}</span>}
            </div>

            <div className="space-y-2">
              <Label>Limite mensuelle (Optionnel)</Label>
              <Input type="number" {...register('monthly_limit')} placeholder="50.00" className="bg-black/20" />
              <p className="text-[10px] text-gray-500 italic">L'enfant recevra une alerte s'il dépasse cette limite.</p>
            </div>

            <div className="space-y-2">
              <Label>Couleur d'avatar</Label>
              <div className="flex gap-3">
                {['#f472b6', '#c084fc', '#60a5fa', '#34d399', '#fbbf24'].map((color) => (
                  <label key={color} className="relative cursor-pointer">
                    <input 
                      type="radio" 
                      value={color} 
                      {...register('avatar_color')} 
                      className="peer sr-only"
                    />
                    <div 
                      className="h-10 w-10 rounded-xl border-2 border-transparent transition-all peer-checked:border-white peer-checked:scale-110 shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-[#f472b6] text-[#0d0811] font-bold">
              {isSubmitting ? 'Création...' : 'Créer le compte'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
