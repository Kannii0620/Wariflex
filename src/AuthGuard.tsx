import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { type Session } from '@supabase/supabase-js';
import Login from './pages/Login';
import { Outlet } from 'react-router-dom';

export default function AuthGuard() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 初回起動時のセッションチェック
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    
    checkSession();

    // 2. ログイン/ログアウトの変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ロード中は真っ青な画面を表示
  if (loading) {
    return <div className="min-h-screen bg-sky-500" />;
  }

  // ★ログインしていなければ「ログイン画面」を強制表示
  if (!session) {
    return <Login />;
  }

  // ★ログインしていれば「本来のページ（Outlet）」を表示
  return <Outlet />;
}