// app/(dashboard)/children/page.tsx
import { createClient } from '@/lib/supabase/server';
import ChildCard from '@/components/children/ChildCard';
import { Button } from '@/components/ui/button';
import { Plus, Inbox } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ChildrenPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Comptes créés par l'utilisateur
  const { data: ownedAccounts } = await supabase
    .from('child_accounts')
    .select('*')
    .eq('created_by', user!.id);

  // Comptes où l'utilisateur est invité et a accepté
  const { data: viewerAccounts } = await supabase
    .from('child_account_viewers')
    .select(`
      child_account_id,
      child_accounts (*)
    `)
    .eq('viewer_id', user!.id)
    .eq('status', 'accepted');

  // Invitations en attente
  const { data: pendingInvitations } = await supabase
    .from('child_account_viewers')
    .select(`
      id,
      invited_email,
      child_account_id,
      child_accounts (name)
    `)
    .eq('invited_email', user!.email)
    .eq('status', 'pending');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enfants</h1>
          <p className="text-gray-400">Gérez l'argent de poche de vos enfants et suivez leurs dépenses.</p>
        </div>
        <Button asChild className="bg-[#6366f1] hover:bg-[#4f46e5]">
          <Link href="/children/new">
            <Plus size={20} className="mr-2" />
            Ajouter un enfant
          </Link>
        </Button>
      </div>

      {pendingInvitations && pendingInvitations.length > 0 && (
        <div className="rounded-xl border border-[#22d3ee]/20 bg-[#22d3ee]/5 p-4">
          <div className="flex items-center gap-3 text-[#22d3ee]">
            <Inbox size={20} />
            <h3 className="font-bold">Invitations en attente</h3>
          </div>
          <div className="mt-3 space-y-3">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg bg-[#13131a] p-3 border border-white/5">
                <span className="text-sm">
                  Vous avez été invité à suivre le compte de <span className="font-bold">{(inv.child_accounts as any).name}</span>
                </span>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#22d3ee] text-black font-bold hover:bg-[#22d3ee]/80">Accepter</Button>
                  <Button size="sm" variant="ghost" className="text-gray-500 hover:text-white">Refuser</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ownedAccounts?.map((account) => (
          <ChildCard 
            key={account.id}
            id={account.id}
            name={account.name}
            balance={account.balance}
            monthly_limit={account.monthly_limit}
            avatar_color={account.avatar_color}
            isOwner={true}
          />
        ))}
        {viewerAccounts?.map((viewer) => {
          const account = (viewer as any).child_accounts;
          return (
            <ChildCard 
              key={account.id}
              id={account.id}
              name={account.name}
              balance={account.balance}
              monthly_limit={account.monthly_limit}
              avatar_color={account.avatar_color}
              isOwner={false}
            />
          );
        })}
      </div>

      {(!ownedAccounts || ownedAccounts.length === 0) && (!viewerAccounts || viewerAccounts.length === 0) && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/5 bg-[#13131a]/50">
          <p className="text-gray-500">Aucun compte enfant trouvé.</p>
          <Button variant="link" className="text-[#6366f1]" asChild>
            <Link href="/children/new">Créer le premier compte</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
