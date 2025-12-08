import { create } from 'zustand';
import { supabase } from './supabase';

export const usePaymentStore = create((set, get) => ({
  payments: [],
  history: [],
  loading: false,

  // 1. データ取得
  fetchPayments: async () => {
    set({ loading: true });

    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      set({ loading: false });
      return;
    }

    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('*');

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      set({ loading: false });
      return;
    }

    const formattedPayments = paymentsData.map((p) => {
      const relatedParticipants = participantsData
        .filter((part) => part.payment_id === p.id)
        .map((part) => ({
          id: part.id,
          name: part.name,
          percentage: part.percentage,
        }));

      return {
        id: p.id,
        title: p.title,
        totalAmount: p.total_amount,
        participants: relatedParticipants,
        completedAt: p.completed_at ? new Date(p.completed_at).toLocaleString() : undefined,
        status: p.status,
      };
    });

    set({
      payments: formattedPayments.filter((p) => p.status === 'active'),
      history: formattedPayments.filter((p) => p.status === 'history'),
      loading: false,
    });
  },

  // 2. 追加
  addPayment: async (title, amount, participants) => {
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([{ title: title, total_amount: amount, status: 'active' }])
      .select()
      .single();

    if (paymentError) {
      console.error('Error adding payment:', paymentError);
      return;
    }

    const participantsToInsert = participants.map((p) => ({
      payment_id: paymentData.id,
      name: p.name,
      percentage: p.percentage,
    }));

    const { error: participantsError } = await supabase
      .from('participants')
      .insert(participantsToInsert);

    if (participantsError) {
      console.error('Error adding participants:', participantsError);
    }

    get().fetchPayments();
  },

  // 3. 履歴へ移動
  moveToHistory: async (id) => {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'history', completed_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) console.error('Error moving to history:', error);
    get().fetchPayments();
  },

  // 4. 削除
  deletePayment: async (id) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting payment:', error);
    get().fetchPayments();
  },
}));