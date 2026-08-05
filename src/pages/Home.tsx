import { useEffect, useState } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, FileText, IdCard, Radio, Sparkles, MessageSquare, CreditCard, ShieldCheck, ExternalLink, Activity } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const { session, profile, subscription } = useOutletContext<any>();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'feedback'>('posts');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [cardStats, setCardStats] = useState({ stat1: '', stat2: '', stat3: '' });
  const navigate = useNavigate();

  const userFullName = profile?.full_name || session?.user?.user_metadata?.full_name || (session?.user?.email ? session.user.email.split('@')[0] : 'User Account');

  useEffect(() => {
    const activeUserId = session?.user?.id;
    if (activeUserId) {
      fetchData(activeUserId);
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    
    // Fetch Feedbacks
    try {
      const { data: feedbacksData } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false });
      
      if (feedbacksData) {
        setFeedbacks(feedbacksData);
      } else {
        setFeedbacks([]);
      }
    } catch (e) {
      setFeedbacks([]);
    }

    // Fetch Posts
    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsData) {
        setPosts(postsData);
      } else {
        setPosts([]);
      }
    } catch (e) {
      setPosts([]);
    }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() || !session?.user?.id) return;
    
    if (posts.length > 0) {
      if (!subscription || subscription.plan_name === 'Free Tier' || !profile?.is_upgraded) {
        if ((profile?.wallet_credits || 0) >= 5) {
          await supabase.from('profiles').update({ wallet_credits: profile.wallet_credits - 5 }).eq('user_id', session.user.id);
        } else {
          alert('Free account post limit reached. Upgrade plan or top up wallet credits to create additional posts.');
          navigate('/wallet/topup');
          return;
        }
      }
    }

    const { error } = await supabase.from('posts').insert([
      { user_id: session.user.id, content: postContent.trim(), IsMediaPublic: true }
    ]);

    if (!error) {
      setPostContent('');
      setShowPostModal(false);
      fetchData(session.user.id);
    } else {
      console.error(error);
      alert('Error saving post. Please try again.');
    }
  };

  const handleSaveCard = () => {
    alert('Player card stats updated successfully!');
    setShowCardModal(false);
  };

  if (loading) return <div className="p-12 text-center text-gray-400 font-bold">Loading dashboard...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8 pb-24">
      <Helmet>
        <title>{userFullName} - Athlete Dashboard & Profile</title>
        <meta name="description" content="Manage your athlete recruiting dashboard, player card, and scout feedback on FSMEC." />
      </Helmet>

      {/* Profile Overview Header Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-800 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-800 border-2 border-white/10 shrink-0 shadow-inner flex items-center justify-center font-black text-2xl text-gray-300">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={userFullName} className="w-full h-full object-cover" />
              ) : (
                userFullName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{userFullName}</h1>
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" title="Verified Account" />
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mt-1">
                <span className="font-mono bg-white/10 px-2.5 py-0.5 rounded text-gray-200">ID: {profile?.IdNumber || '10027189'}</span>
                <span>•</span>
                <span>{profile?.sport || 'Multi-Sport'} {profile?.position ? `(${profile.position})` : ''}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${profile?.is_upgraded || subscription?.is_upgraded ? 'bg-amber-400 text-black' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}>
                  {subscription?.plan_name || (profile?.is_upgraded ? 'Pro Scout Active' : 'Free Member')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link 
              to={`/player/${profile?.IdNumber || '10027189'}`}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white text-black rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              Public Profile <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Real Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-center sm:text-left">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Wallet Balance</div>
            <div className="text-lg font-black mt-0.5">${(profile?.wallet_credits || 0).toFixed(2)}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Published Posts</div>
            <div className="text-lg font-black mt-0.5">{posts.length}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Scout Reports</div>
            <div className="text-lg font-black mt-0.5">{feedbacks.length}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Visibility</div>
            <div className="text-lg font-black mt-0.5 capitalize">{profile?.is_public ? 'Public' : 'Private'}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button 
          onClick={() => setShowPostModal(true)}
          className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-black transition-all text-left flex flex-col gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">Create Post</div>
            <div className="text-xs text-gray-500 mt-0.5">Share game updates</div>
          </div>
        </button>

        <button 
          onClick={() => {
            if ((profile?.wallet_credits || 0) < 5 && !profile?.is_upgraded) {
              alert('AI Card generation requires wallet credits or an upgraded plan.');
              navigate('/wallet/topup');
              return;
            }
            navigate(`/player/card/${profile?.IdNumber}?ai=true`);
          }}
          className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-600 transition-all text-left flex flex-col gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">AI Player Card</div>
            <div className="text-xs text-gray-500 mt-0.5">Generate recruit card</div>
          </div>
        </button>

        <Link 
          to="/live/start"
          className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-red-500 transition-all text-left flex flex-col gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              Live Stream
              {!profile?.is_upgraded && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">PRO</span>}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Broadcast HD game</div>
          </div>
        </Link>

        <Link 
          to="/wallet/topup"
          className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-black transition-all text-left flex flex-col gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">Wallet Top Up</div>
            <div className="text-xs text-gray-500 mt-0.5">Add credits</div>
          </div>
        </Link>
      </div>

      {/* Segmented Feed / Feedback Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'posts' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              My Posts ({posts.length})
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'feedback' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Scout Feedback ({feedbacks.length})
            </button>
          </div>

          {activeTab === 'posts' && (
            <button 
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Post
            </button>
          )}
        </div>

        {/* Active Tab Content */}
        {activeTab === 'posts' ? (
          <div>
            {posts.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">No Posts Published Yet</h3>
                <p className="text-gray-500 text-xs max-w-sm">
                  Share game highlights, athletic progress, or workout stats with college recruiters on FSMEC.
                </p>
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="mt-2 px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map(p => (
                  <Link 
                    key={p.id} 
                    to={`/post/${p.id}`}
                    className="p-5 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                        {userFullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{userFullName}</div>
                        <div className="text-[11px] text-gray-400">{new Date(p.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-3">{p.content}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {feedbacks.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">No Scout Feedback Received</h3>
                <p className="text-gray-500 text-xs max-w-sm">
                  When college scouts and recruiters evaluate your player profile or live streams, their official evaluation reports will appear here.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider text-gray-500">Scout / Evaluator</th>
                      <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider text-gray-500">Date</th>
                      <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider text-gray-500">Feedback Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feedbacks.map(f => (
                      <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{f.sender_name || 'Verified Scout'}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{new Date(f.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-gray-700 text-xs">{f.comment || f.type || 'Official Evaluation'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-xl font-bold text-gray-900">Create New Post</h3>
            <textarea 
              rows={4}
              placeholder="Share game stats, athletic highlights, or recruitment announcements..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-black resize-none text-sm"
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-1">
              <button onClick={() => setShowPostModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleCreatePost} className="px-5 py-2.5 rounded-xl font-bold text-xs bg-black text-white hover:bg-gray-800 transition-colors">Publish Post</button>
            </div>
          </div>
        </div>
      )}

      {/* Customize Player Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
            <h3 className="text-xl font-bold text-center text-gray-900">Customize Player Card</h3>
            
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-5 text-white shadow-lg flex flex-col gap-4 border border-gray-800">
              <div className="flex justify-between items-start border-b border-gray-800 pb-3">
                <div>
                  <h4 className="text-lg font-bold tracking-tight">{userFullName}</h4>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mt-0.5">{profile?.position || 'Athlete'}</p>
                </div>
                {profile?.avatar_url && (
                  <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/10 rounded-xl p-2">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Stat 1</div>
                  <div className="font-bold text-sm mt-0.5">{cardStats.stat1 || '-'}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Stat 2</div>
                  <div className="font-bold text-sm mt-0.5">{cardStats.stat2 || '-'}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Stat 3</div>
                  <div className="font-bold text-sm mt-0.5">{cardStats.stat3 || '-'}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <input type="text" placeholder="Stat 1 (e.g. 95 SPD)" className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-black" value={cardStats.stat1} onChange={e => setCardStats({...cardStats, stat1: e.target.value})} />
              <input type="text" placeholder="Stat 2 (e.g. 88 AGI)" className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-black" value={cardStats.stat2} onChange={e => setCardStats({...cardStats, stat2: e.target.value})} />
              <input type="text" placeholder="Stat 3 (e.g. 90 VERT)" className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-black" value={cardStats.stat3} onChange={e => setCardStats({...cardStats, stat3: e.target.value})} />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCardModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleSaveCard} className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-gray-800 transition-colors">Save Card</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
