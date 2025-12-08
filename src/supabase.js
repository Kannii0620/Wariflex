import { createClient } from '@supabase/supabase-js';

// 環境変数を読み込む
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SupabaseのURLまたはKeyが設定されていません。.envファイルを確認してください。');
}

// クライアントを作成してエクスポート
export const supabase = createClient(supabaseUrl, supabaseKey);