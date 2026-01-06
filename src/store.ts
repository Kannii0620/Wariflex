import { create } from 'zustand';
import { supabase } from './supabase'; // ← さっき作ったファイルをインポート

// 参加者型 (DBに合わせて ID は string に変更)
export type Participant = {
  id: string; 
  name: string;
  percentage: number; 
};

// 支払い型 (DBに合わせて ID は string に変更)
export type Payment = {
  id: string;
  title: string;
  totalAmount: number;
  participants: Participant[];
  completedAt?: string;
  status: 'active' | 'history';
  message?: string;
};

type PaymentState = {
  payments: Payment[]; // 未精算リスト
  history: Payment[];  // 履歴リスト
  loading: boolean;    // 読み込み中かどうか

  fetchPayments: () => Promise<void>; // データ取得
  addPayment: (title: string, amount: number, participants: { name: string; percentage: number }[], message: string) => Promise<void>;
  moveToHistory: (id: string) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  history: [],
  loading: false,

  // 1. データ取得 (DBから読み込む)
  fetchPayments: async () => {
    set({ loading: true });

    // 親テーブル (payments) 取得
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      set({ loading: false });
      return;
    }

    // 子テーブル (participants) 取得
    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('*');

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      set({ loading: false });
      return;
    }

    // データを結合して整形
    const formattedPayments: Payment[] = paymentsData.map((p) => {
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
        message: p.message,
      };
    });

    set({
      payments: formattedPayments.filter((p) => p.status === 'active'),
      history: formattedPayments.filter((p) => p.status === 'history'),
      loading: false,
    });
  },

  // 2. 追加 (DBに保存)
  addPayment: async (title, amount, participants, message) => {
    // まず親テーブルに保存
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([{ title: title, total_amount: amount, status: 'active', message: message }])
      .select()
      .single();

    if (paymentError) {
      console.error('Error adding payment:', paymentError);
      return;
    }

    // 次に子テーブルに保存
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

    // 最新データを再取得
    get().fetchPayments();
  },

  // 3. 履歴へ移動 (ステータス更新)
  moveToHistory: async (id) => {
    const { error } = await supabase
      .from('payments')
      .update({ status: 'history', completed_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) console.error('Error moving to history:', error);
    get().fetchPayments();
  },

  // 4. 削除 (DBから削除)
  deletePayment: async (id) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting payment:', error);
    get().fetchPayments();
  },
}));