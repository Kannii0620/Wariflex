import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabase';
import logo from '../components/WariFlex_Logo.png'; 

export default function Login() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 animate-fade-in-up">
        
        {/* ロゴエリア */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="WariFlex" className="h-12 mb-3 object-contain" />
          <h1 className="text-xl font-bold text-gray-800">
            Wari<span className="text-blue-600">Flex</span> にログイン
          </h1>
        </div>

        {/* Supabase製のログインフォーム */}
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb', // ボタンの色（青）
                  brandAccent: '#1d4ed8',
                },
              },
            },
          }}
          providers={[]} // 今回はメールアドレス認証のみ
          localization={{
            variables: {
              sign_in: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                button_label: 'ログイン',
                loading_button_label: 'ログイン中...',
                link_text: 'すでにアカウントをお持ちの方',
              },
              sign_up: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                button_label: '新規登録',
                loading_button_label: '登録中...',
                link_text: 'アカウントをお持ちでない方',
              },
              forgotten_password: {
                link_text: 'パスワードを忘れた場合',
                button_label: '再設定メールを送信',
              }
            }
          }}
        />
      </div>
    </div>
  );
}