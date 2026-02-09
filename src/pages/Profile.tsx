import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { BsPersonCircle, BsCopy, BsCheckLg, BsBoxArrowRight, BsPencilSquare, BsLock } from "react-icons/bs";
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string, display_name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  // プロフィール編集用
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  // パスワード変更用
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
      setNewName(data.display_name || "");
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (profile?.username) {
      navigator.clipboard.writeText(profile.username);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const updateProfile = async () => {
    if (!newName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: newName })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, display_name: newName } : null);
      setIsEditing(false);
    }
  };

  // ★ パスワード変更処理（セキュリティ強化版）
  const handlePasswordChange = async () => {
    setPasswordMessage(null);
    if (!currentPassword || !newPassword) {
      setPasswordMessage({ text: "すべての項目を入力してください", type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: "新しいパスワードは6文字以上にしてください", type: 'error' });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) return;

      // 1. まず現在のパスワードで「再ログイン」を試みて本人確認する
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordMessage({ text: "現在のパスワードが間違っています", type: 'error' });
        return;
      }

      // 2. 本人確認ができたら、新しいパスワードに更新する
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      setPasswordMessage({ text: "パスワードを変更しました！", type: 'success' });
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setIsChangingPassword(false), 2000);

    } catch (error: any) {
      console.error("Password update error:", error);
      setPasswordMessage({ text: "エラーが発生しました: " + error.message, type: 'error' });
    }
  };

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await supabase.auth.signOut();
      navigate("/");
    }
  };

  if (loading) return <div className="min-h-screen bg-blue-500" />;

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 pb-24">
      <div className="max-w-md mx-auto p-4 text-white">
        <Header />

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl animate-fade-in-up space-y-8">
          
          {/* プロフィール情報セクション */}
          <div>
            <div className="flex flex-col items-center mb-6">
              <div className="bg-white text-blue-500 rounded-full p-4 mb-4 shadow-lg">
                <BsPersonCircle size={64} />
              </div>
              
              {isEditing ? (
                <div className="flex gap-2 w-full max-w-xs">
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-center font-bold focus:outline-none focus:bg-white/30"
                  />
                  <button onClick={updateProfile} className="bg-emerald-500 p-2 rounded-lg hover:bg-emerald-600">
                    <BsCheckLg />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{profile?.display_name || "ゲスト"}</h2>
                  <button onClick={() => setIsEditing(true)} className="text-white/60 hover:text-white">
                    <BsPencilSquare />
                  </button>
                </div>
              )}
              <p className="text-blue-100 text-sm mt-1">マイプロフィール</p>
            </div>

            <div className="space-y-4">
              <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-blue-200 mb-1">あなたのID (友達に教えてね)</p>
                <div className="flex items-center justify-between">
                  <code className="text-xl font-mono font-bold tracking-wider">
                    {profile?.username || "Loading..."}
                  </code>
                  <button 
                    onClick={copyToClipboard}
                    className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                  >
                    {copied ? <BsCheckLg /> : <BsCopy />}
                    {copied ? "コピー完了" : "コピー"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ★ パスワード変更セクション (新規追加) */}
          <div className="border-t border-white/10 pt-6">
            <button 
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="flex items-center gap-2 text-white font-bold mb-4 hover:text-blue-200 transition-colors w-full"
            >
              <BsLock className="text-lg" />
              パスワード変更
              <span className="ml-auto text-sm opacity-60">{isChangingPassword ? "▲ 閉じる" : "▼ 開く"}</span>
            </button>

            {isChangingPassword && (
              <div className="bg-black/20 p-4 rounded-xl space-y-3 animate-fade-in">
                <div>
                  <label className="text-xs text-blue-200 block mb-1">現在のパスワード</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                    placeholder="セキュリティのため入力してください"
                  />
                </div>
                <div>
                  <label className="text-xs text-blue-200 block mb-1">新しいパスワード</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                    placeholder="6文字以上"
                  />
                </div>
                
                {passwordMessage && (
                  <p className={`text-sm font-bold text-center ${passwordMessage.type === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {passwordMessage.text}
                  </p>
                )}

                <button 
                  onClick={handlePasswordChange}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors mt-2"
                >
                  変更する
                </button>
              </div>
            )}
          </div>

          {/* ログアウトボタン */}
          <button 
            onClick={handleLogout}
            className="w-full bg-rose-500/80 hover:bg-rose-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <BsBoxArrowRight size={20} />
            ログアウト
          </button>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}