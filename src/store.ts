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

  // 3. ★通知取得 (自分宛ての請求) - 修正版
  fetchNotifications: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // ① まず「請求データ」と「支払い情報（作成者のID含む）」を取得
    const { data, error } = await supabase
      .from('participants')
      .select(`
        id,
        percentage,
        payments (
          title,
          total_amount,
          created_at,
          user_id
        )
      `)
      .eq('linked_user_id', user.id)
      .eq('status', 'pending');

    if (error) { console.error("Notification error:", error); return; }
    if (!data || data.length === 0) { set({ notifications: [] }); return; }

    // ② 支払い作成者のIDを集める（重複なし）
    // @ts-ignore
    const userIds = [...new Set(data.map((item: any) => item.payments?.user_id).filter(Boolean))];

    // ③ プロフィール情報を別便で取ってくる
    let profilesMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      if (profilesData) {
        profilesData.forEach((p) => {
          profilesMap[p.id] = p.display_name;
        });
      }
    }

    // ④ 合体させる
    const notifs: NotificationItem[] = data.map((item: any) => {
      // 安全にアクセスするために一旦変数に入れる
      const p = item.payments;

      // もしRLSのせいで payments が null なら、空のデータを返してクラッシュを防ぐ
      if (!p) {
        return {
          id: item.id,
          payment_title: "詳細権限なし",
          amount_to_pay: 0,
          payer_name: "不明",
          created_at: new Date().toISOString()
        };
      }

      // ここからは p (payments) が確実に存在する場合の処理
      const total = p.total_amount ?? 0;
      const amount = Math.floor(total * item.percentage / 100);
      const payerId = p.user_id;
      const payerName = profilesMap[payerId] || "不明なユーザー";

      return {
        id: item.id,
        payment_title: p.title || "無題の支払い",
        amount_to_pay: amount,
        payer_name: payerName,
        created_at: p.created_at
      };
    });

    set({ notifications: notifs });
  },

  // 4. ★承認/拒否アクション
  respondToRequest: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('participants')
      .update({ status: status })
      .eq('id', id)
      .select();

    if (error) {
      console.error("更新エラー:", error);
      return;
    }

    // ✅ 更新が成功（dataが空でない）した場合のみ、フロントのリストから削除
    if (data && data.length > 0) {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
    }
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

    // 1. 参加者全員のIDを抽出して配列にする (nullを除外)
    const participantIds = participants
      .map(p => p.linked_user_id)
      .filter((id): id is string => !!id);

    // 2. paymentsテーブルに保存 (participant_ids を追加！)
    const { data: paymentData } = await supabase
      .from('payments')
      .insert([{ 
        title, 
        total_amount: amount, 
        status: 'active', 
        message,
        user_id: user.id, // 作成者IDも明示的に入れると確実
        participant_ids: participantIds // 👈 これがループ回避の鍵！
      }])
      .select()
      .single();

    if (!paymentData) return;

    // 3. participantsテーブル（子）への保存
    const participantsToInsert = participants.map((p) => ({
      payment_id: paymentData.id,
      name: p.name,
      percentage: p.percentage,
      linked_user_id: p.linked_user_id || null,
      status: p.linked_user_id ? 'pending' : 'approved',
      owner_id: user.id // 👈 SQLで追加したowner_idもここで入れる！
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