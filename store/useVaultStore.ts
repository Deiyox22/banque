import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchTransactions } from '@/lib/api/transactions';

interface VaultStore {
  transactions: any[];
  isLoading: boolean;
  setTransactions: (data: any[]) => void;
  fetchTransactions: (month: number, year: number) => Promise<void>;
  deleteLocalTransaction: (id: string) => void;
}

export const useVaultStore = create<VaultStore>()(
  persist(
    (set) => ({
      transactions: [],
      isLoading: false,
      setTransactions: (data) => set({ transactions: data }),
      fetchTransactions: async (month, year) => {
        set({ isLoading: true });
        try {
          const data = await fetchTransactions(month, year);
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
