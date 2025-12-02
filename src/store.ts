import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Participant = {
  id: number;
  name: string;
  percentage: number; 
};

export type Payment = {
  id: number;
  title: string;
  totalAmount: number;
  participants: Participant[];
};

type PaymentState = {
  payments: Payment[];
  addPayment: (payment: Payment) => void;
  removePayment: (id: number) => void; // ← 1. 型定義に追加
};

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      payments: [],

      addPayment: (newPayment) =>
        set((state) => ({
          payments: [...state.payments, newPayment],
        })),

      // 2. 削除ロジックを追加
      removePayment: (id) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'wariflex-storage',
    }
  )
);