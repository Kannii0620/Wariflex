import { create } from 'zustand';
import { supabase } from './supabase';

// 参加者型
export type Participant = {
  id: string; 
  name: string;
  percentage: number;
  linked_user_id?: string;
  status?: string;
};

// 支払い型
export type Payment = {
  id: string;
  title: string;
  totalAmount: number;
  participants: Participant[];
  completedAt?: string;
  status: 'active' | 'history';
  message?: string;
  date?: string;
};

// 友達型
export type Friend = {
  friend_id: string;
  username: string;
  display_name: string;
};

// ★通知型 (新規追加)
export type NotificationItem = {
  id: string; // participantのID
  payment_title: string;
  amount_to_pay: number; // 自分が払う額
  payer_name: string; // 請求してきた人の名前
  created_at: string;
};

type PaymentState = {
  payments: Payment[];
  history: Payment[];
  friends: Friend[];
  notifications: NotificationItem[]; // ★追加
  loading: boolean;

  fetchPayments: () => Promise<void>;
  fetchFriends: () => Promise<void>;
  fetchNotifications: () => Promise<void>; // ★追加

  addFriend: (targetUsername: string) => Promise<{ success: boolean; message: string }>;
  addPayment: (title: string, amount: number, participants: { name: string; percentage: number; linked_user_id?: string }[], message: string) => Promise<void>;
  
  respondToRequest: (id: string, response: 'approved' | 'rejected') => Promise<void>; // ★追加
  
  moveToHistory: (id: string) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteFriend: (friend_id: string) => Promise<void>;
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  history: [],
  friends: [],
  notifications: [],
  loading: false,

  // 1. データ取得
  fetchPayments: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ payments: [], history: [], loading: false }); return; }

    // 自分の支払い
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // 参加者情報
    const { data: participantsData } = await supabase.from('participants').select('*');

    if (!paymentsData) { set({ loading: false }); return; }

    const formattedPayments: Payment[] = paymentsData.map((p) => {
      const relatedParticipants = participantsData
        ? participantsData.filter((part) => part.payment_id === p.id).map((part) => ({
              id: part.id,
              name: part.name,
              percentage: part.percentage,
              linked_user_id: part.linked_user_id,
              status: part.status,
            }))
        : [];

      return {
        id: p.id,
        title: p.title,
        totalAmount: p.total_amount,
        participants: relatedParticipants,
        completedAt: p.completed_at ? new Date(p.completed_at).toLocaleString() : undefined,
        status: p.status,
        message: p.message,
        date: p.created_at ? new Date(p.created_at).toLocaleDateString() : undefined,
      };
    });

    set({
      payments: formattedPayments.filter((p) => p.status === 'active'),
      history: formattedPayments.filter((p) => p.status === 'history'),
      loading: false,
    });
  },

  // 2. 友達取得
  fetchFriends: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('friends').select(`friend_id, profiles:friend_id (username, display_name)`).eq('user_id', user.id);
    if (data) {
      set({ friends: data.map((item: any) => ({ friend_id: item.friend_id, username: item.profiles.username, display_name: item.profiles.display_name })) });
    }
  },

  // 3. ★通知取得 (自分宛ての請求)
  fetchNotifications: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // participantsテーブルから「自分が指定されていて、まだpendingのもの」を取得
    // 親のpayments情報と、請求者(user_id)のプロフィールも一緒に取ってくる
    const { data, error } = await supabase
      .from('participants')
      .select(`
        id,
        percentage,
        payments (
          title,
          total_amount,
          created_at,
          profiles ( display_name )
        )
      `)
      .eq('linked_user_id', user.id)
      .eq('status', 'pending');

    if (error) { console.error("Notification error:", error); return; }

    const notifs: NotificationItem[] = data.map((item: any) => {
      // 支払い額の計算 (合計 * % / 100)
      const total = item.payments.total_amount;
      const amount = Math.floor(total * item.percentage / 100);

      return {
        id: item.id,
        payment_title: item.payments.title,
        amount_to_pay: amount,
        payer_name: item.payments.profiles?.display_name || "名無し",
        created_at: item.payments.created_at
      };
    });

    set({ notifications: notifs });
  },

  // 4. ★承認/拒否アクション
  respondToRequest: async (id, response) => {
    await supabase.from('participants').update({ status: response }).eq('id', id);
    get().fetchNotifications(); // リスト更新
  },

  // 他の機能 (addFriend, addPaymentなど)
  addFriend: async (targetUsername) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "ログインしてください" };
    const { data: targetProfile } = await supabase.from('profiles').select('id, username').eq('username', targetUsername).single();
    if (!targetProfile) return { success: false, message: "ユーザーが見つかりませんでした" };
    if (targetProfile.id === user.id) return { success: false, message: "自分自身は登録できません" };
    const { error } = await supabase.from('friends').insert({ user_id: user.id, friend_id: targetProfile.id });
    if (error) return { success: false, message: "すでに登録済みかエラーです" };
    get().fetchFriends();
    return { success: true, message: `${targetUsername} を追加しました！` };
  },

  addPayment: async (title, amount, participants, message) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: paymentData } = await supabase.from('payments').insert([{ title, total_amount: amount, status: 'active', message }]).select().single();
    if (!paymentData) return;
    const participantsToInsert = participants.map((p) => ({
      payment_id: paymentData.id,
      name: p.name,
      percentage: p.percentage,
      linked_user_id: p.linked_user_id || null,
      status: p.linked_user_id ? 'pending' : 'approved'
    }));
    await supabase.from('participants').insert(participantsToInsert);
    get().fetchPayments();
  },

  moveToHistory: async (id) => { await supabase.from('payments').update({ status: 'history', completed_at: new Date().toISOString() }).eq('id', id); get().fetchPayments(); },
  deletePayment: async (id) => { await supabase.from('payments').delete().eq('id', id); get().fetchPayments(); },
  deleteHistoryItem: async (id) => { await supabase.from('payments').delete().eq('id', id); get().fetchPayments(); },
  clearHistory: async () => { await supabase.from('payments').delete().eq('status', 'history'); get().fetchPayments(); },
  deleteFriend: async (friend_id) => { 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('friends').delete().eq('user_id', user.id).eq('friend_id', friend_id);
    get().fetchFriends(); 
  }
}));