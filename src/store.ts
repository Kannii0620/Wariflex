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

// 通知型
export type NotificationItem = {
  id: string; // participantのID
  payment_title: string;
  amount_to_pay: number; // 自分が払う額
  payer_name: string; // 請求してきた人の名前
  created_at: string;
};

// 支払い登録時の参加者入力
export type NewParticipant = {
  name: string;
  percentage: number;
  linked_user_id?: string;
};

// --- DBの行の型 ---
type ParticipantRow = {
  id: string;
  name: string;
  percentage: number;
  linked_user_id: string | null;
  status: string | null;
};

type PaymentRow = {
  id: string;
  title: string;
  total_amount: number;
  status: Payment['status'];
  message: string | null;
  created_at: string | null;
  completed_at: string | null;
  participants: ParticipantRow[] | null;
};

type FriendRow = {
  friend_id: string;
  profiles: { username: string; display_name: string };
};

type NotificationRow = {
  id: string;
  percentage: number;
  // RLSで支払いが見えない場合は null になる
  payments: { title: string | null; total_amount: number | null; created_at: string; user_id: string } | null;
};

type PaymentState = {
  payments: Payment[];
  history: Payment[];
  friends: Friend[];
  notifications: NotificationItem[];
  loading: boolean;

  fetchPayments: () => Promise<void>;
  fetchFriends: () => Promise<void>;
  fetchNotifications: () => Promise<void>;

  addFriend: (targetUsername: string) => Promise<{ success: boolean; message: string }>;
  addPayment: (title: string, amount: number, participants: NewParticipant[], message: string) => Promise<boolean>;

  respondToRequest: (id: string, response: 'approved' | 'rejected') => Promise<void>;

  moveToHistory: (id: string) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteFriend: (friend_id: string) => Promise<void>;
};

const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

const toPayment = (row: PaymentRow): Payment => ({
  id: row.id,
  title: row.title,
  totalAmount: row.total_amount,
  participants: (row.participants ?? []).map((part) => ({
    id: part.id,
    name: part.name,
    percentage: part.percentage,
    linked_user_id: part.linked_user_id ?? undefined,
    status: part.status ?? undefined,
  })),
  completedAt: row.completed_at ? new Date(row.completed_at).toLocaleString() : undefined,
  status: row.status,
  message: row.message ?? undefined,
  date: row.created_at ? new Date(row.created_at).toLocaleDateString() : undefined,
});

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  history: [],
  friends: [],
  notifications: [],
  loading: false,

  // 自分の支払い一覧（参加者込み）を取得
  fetchPayments: async () => {
    set({ loading: true });
    const user = await getCurrentUser();
    if (!user) { set({ payments: [], history: [], loading: false }); return; }

    const { data, error } = await supabase
      .from('payments')
      .select('*, participants(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data) {
      if (error) console.error('Payments取得失敗:', error);
      set({ loading: false });
      return;
    }

    const formattedPayments = (data as PaymentRow[]).map(toPayment);

    set({
      payments: formattedPayments.filter((p) => p.status === 'active'),
      history: formattedPayments.filter((p) => p.status === 'history'),
      loading: false,
    });
  },

  fetchFriends: async () => {
    const user = await getCurrentUser();
    if (!user) return;
    const { data } = await supabase
      .from('friends')
      .select('friend_id, profiles:friend_id (username, display_name)')
      .eq('user_id', user.id);
    if (data) {
      set({
        friends: (data as unknown as FriendRow[]).map((item) => ({
          friend_id: item.friend_id,
          username: item.profiles.username,
          display_name: item.profiles.display_name,
        })),
      });
    }
  },

  // 自分宛ての未回答の請求を取得
  fetchNotifications: async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('participants')
      .select('id, percentage, payments (title, total_amount, created_at, user_id)')
      .eq('linked_user_id', user.id)
      .eq('status', 'pending');

    if (error) { console.error("Notification error:", error); return; }
    if (!data || data.length === 0) { set({ notifications: [] }); return; }

    const rows = data as unknown as NotificationRow[];

    // 請求者の表示名は profiles から別クエリで引く
    const payerIds = [...new Set(rows.flatMap((row) => row.payments ? [row.payments.user_id] : []))];
    const payerNames: Record<string, string> = {};
    if (payerIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', payerIds);

      (profilesData as { id: string; display_name: string }[] | null)?.forEach((p) => {
        payerNames[p.id] = p.display_name;
      });
    }

    const notifs: NotificationItem[] = rows.map((row) => {
      const payment = row.payments;
      if (!payment) {
        return {
          id: row.id,
          payment_title: "詳細権限なし",
          amount_to_pay: 0,
          payer_name: "不明",
          created_at: new Date().toISOString(),
        };
      }

      return {
        id: row.id,
        payment_title: payment.title || "無題の支払い",
        amount_to_pay: Math.floor((payment.total_amount ?? 0) * row.percentage / 100),
        payer_name: payerNames[payment.user_id] || "不明なユーザー",
        created_at: payment.created_at,
      };
    });

    set({ notifications: notifs });
  },

  respondToRequest: async (id, response) => {
    const { data, error } = await supabase
      .from('participants')
      .update({ status: response })
      .eq('id', id)
      .select();

    if (error) {
      console.error("更新エラー:", error);
      return;
    }

    // 更新できた場合のみ、再取得せずにリストから取り除く
    if (data && data.length > 0) {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
    }
  },

  addFriend: async (targetUsername) => {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "ログインしてください" };
    const { data: targetProfile } = await supabase.from('profiles').select('id, username').eq('username', targetUsername).single();
    if (!targetProfile) return { success: false, message: "ユーザーが見つかりませんでした" };
    if (targetProfile.id === user.id) return { success: false, message: "自分自身は登録できません" };
    const { error } = await supabase.from('friends').insert({ user_id: user.id, friend_id: targetProfile.id });
    if (error) return { success: false, message: "すでに登録済みかエラーです" };
    await get().fetchFriends();
    return { success: true, message: `${targetUsername} を追加しました！` };
  },

  addPayment: async (title, amount, participants, message) => {
    const user = await getCurrentUser();
    if (!user) return false;

    const participantIds = participants
      .map(p => p.linked_user_id)
      .filter((id): id is string => !!id);

    // user_id はDB側の DEFAULT auth.uid() で入る
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        title,
        total_amount: amount,
        status: 'active',
        message,
        participant_ids: participantIds
      }])
      .select()
      .single();

    if (paymentError || !paymentData) {
      console.error('Payment保存失敗:', paymentError);
      return false;
    }

    const { error: partError } = await supabase
      .from('participants')
      .insert(participants.map((p) => ({
        payment_id: paymentData.id,
        name: p.name,
        percentage: p.percentage,
        linked_user_id: p.linked_user_id || null,
        status: p.linked_user_id ? 'pending' : 'approved',
        user_id: user.id
      })));

    if (partError) {
      console.error('Participants保存失敗:', partError);
      // 参加者なしの支払いが残らないように取り消す
      await supabase.from('payments').delete().eq('id', paymentData.id);
      return false;
    }

    await get().fetchPayments();
    return true;
  },

  moveToHistory: async (id) => {
    await supabase.from('payments').update({ status: 'history', completed_at: new Date().toISOString() }).eq('id', id);
    await get().fetchPayments();
  },

  deletePayment: async (id) => {
    await supabase.from('payments').delete().eq('id', id);
    await get().fetchPayments();
  },

  clearHistory: async () => {
    const user = await getCurrentUser();
    if (!user) return;
    await supabase.from('payments').delete().eq('user_id', user.id).eq('status', 'history');
    await get().fetchPayments();
  },

  deleteFriend: async (friend_id) => {
    const user = await getCurrentUser();
    if (!user) return;
    await supabase.from('friends').delete().eq('user_id', user.id).eq('friend_id', friend_id);
    await get().fetchFriends();
  }
}));
