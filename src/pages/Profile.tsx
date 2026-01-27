import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { BsPersonCircle, BsCopy, BsCheckLg, BsBoxArrowRight, BsPencilSquare } from "react-icons/bs";
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string, display_name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

  const handleLogout = async () => {
    if (confirm("ログアウトしますか？")) {
      await supabase.auth.signOut();
      navigate("/"); // ログイン画面へ戻る(AuthGuardが処理)
    }
  };

  if (loading) return <div className="min-h-screen bg-blue-500" />;

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-400 to-blue-800 pb-24">
      <div className="max-w-md mx-auto p-4 text-white">
        <Header />

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl animate-fade-in-up">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white text-blue-500 rounded-full p-4 mb-4 shadow-lg">
              <BsPersonCircle size={64} />
            </div>
            
            {/* 表示名編集エリア */}
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
            {/* ID表示エリア */}
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

            {/* ログアウトボタン */}
            <button 
              onClick={handleLogout}
              className="w-full bg-rose-500/80 hover:bg-rose-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors mt-8"
            >
              <BsBoxArrowRight size={20} />
              ログアウト
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}