// app/(dashboard)/children/[childId]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatCurrency, cn } from '@/lib/utils';
import ChildTransactionList from '@/components/children/ChildTransactionList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Settings2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default async function ChildDetailPage({ params }: { params: { childId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: account } = await supabase
    .from('child_accounts')
    .select('*')
    .eq('id', params.childId)
    .single();

  if (!account) notFound();

  const isOwner = account.created_by === user!.id;

  const { data: transactions } = await supabase
    .from('child_transactions')
    .select('*')
    .eq('child_account_id', params.childId)
    .order('date', { ascending: false });

  const { data: viewers } = await supabase
    .from('child_account_viewers')
    .select('*')
    .eq('child_account_id', params.childId);

  return (
    <div className="space-y-8">
      <Link 
        href="/children" 
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#f472b6] transition-colors"
      >
        <ArrowLeft size={16} />
        Retour aux enfants
      </Link>

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="h-20 w-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl"
            style={{ backgroundColor: account.avatar_color }}
          >
            {account.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{account.name}</h1>
            <p className="text-gray-400">
              Solde actuel : <span className="font-mono text-white font-bold">{formatCurrency(account.balance)}</span>
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/5 bg-white/5">
              <Settings2 size={18} className="mr-2" />
              Gérer
            </Button>
            <Button variant="destructive">
              <Trash2 size={18} className="mr-2" />
              Supprimer
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Historique</h2>
            {isOwner && (
              <Button size="sm" className="bg-[#f472b6] text-[#0d0811] font-bold">
                Ajouter une transaction
              </Button>
            )}
          </div>
          <ChildTransactionList transactions={transactions || []} />
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl border border-[#f472b6]/10 bg-[#1a1122] p-6">
            <h3 className="mb-4 font-bold text-[#f472b6]">Accès partagé</h3>
            <div className="space-y-4">
              {viewers?.map((viewer) => (
                <div key={viewer.id} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-white">{viewer.invited_email}</span>
                    <span className={cn(
                      "text-[10px] uppercase font-bold",
                      viewer.status === 'accepted' ? "text-green-500" : "text-yellow-500"
                    )}>
                      {viewer.status === 'accepted' ? 'Accepté' : 'En attente'}
                    </span>
                  </div>
                  {isOwner && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400">
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              ))}
              {viewers?.length === 0 && (
                <p className="text-sm text-gray-500 italic">Aucun partage pour le moment.</p>
              )}
              {isOwner && (
                <Button className="w-full mt-4 bg-white/5 border border-white/5 text-xs h-10 hover:bg-[#f472b6]/10 hover:text-[#f472b6] hover:border-[#f472b6]/20">
                  <UserPlus size={16} className="mr-2" />
                  Inviter un proche
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
