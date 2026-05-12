import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchTransactionsData } from '@/lib/api/transactions';

interface VaultStore {
  transactions: any[];
  displayName: string | null;
  isLoading: boolean;
  setTransactions: (data: any[]) => void;
  setDisplayName: (name: string) => void;
  fetchTransactions: (month: number, year: number) => Promise<void>;
  deleteLocalTransaction: (id: string) => void;
}

export const useVaultStore = create<VaultStore>()(
  persist(
    (set) => ({
      transactions: [],
      displayName: null,
      isLoading: false,
      setTransactions: (data) => set({ transactions: data }),
      setDisplayName: (name) => set({ displayName: name }),
      fetchTransactions: async (month, year) => {
        set({ isLoading: true });
        try {
          const data = await fetchTransactionsData(month, year);
          set({ transactions: data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },
      deleteLocalTransaction: (id) => 
        set((state) => ({ 
          transactions: state.transactions.filter(t => !t.id.startsWith(id)) 
        })),
    }),
    {
      name: 'vault-storage',
    }
  )
);
