import { useEffect, useState } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Filter, Download, Plus, FileText, IdCard, Radio, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  const { session, profile, subscription } = useOutletContext<any>();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [cardStats, setCardStats] = useState({ stat1: '', stat2: '', stat3: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const activeUserId = session?.user?.id || 'demo-user-1';
    fetchData(activeUserId);
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
      
      if (feedbacksData && feedbacksData.length > 0) {
        setFeedbacks(feedbacksData);
      } else {
        setFeedbacks([
          {
            id: 'fb-1',
            scout_name: 'Coach Marcus Vance',
            organization: 'UCLA Basketball Scouting',
            comment: 'Exceptional lateral quickness and court vision during the Midwest showcase.',
            rating: 5,
            created_at: '2 hours ago'
          },
          {
            id: 'fb-2',
            scout_name: 'Elena Rostova',
            organization: 'MLS Next Youth Scout',
            comment: 'High football IQ with great first touch on transition play.',
            rating: 5,
            created_at: '1 day ago'
          }
        ]);
      }
    } catch (e) {
      // fallback handled above
    }

    // Fetch Posts
    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsData && postsData.length > 0) {
        setPosts(postsData);
      } else {
        setPosts([
          {
            id: 'post-1',
            content: 'Just dropped 24 pts and 9 asts in the national recruit showcase! Check out my player card and stream replay.',
            created_at: '3 hours ago',
            IsMediaPublic: true,
            media_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop'
          }
        ]);
      }
    } catch (e) {
      // fallback handled above
    }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    
    if (posts.length > 0) {
      if (!subscription || subscription.plan_name === 'Starter' || !profile?.is_upgraded) {
        if (profile?.wallet_credits >= 5) { // Assuming 5 credits to post
          // deduct credits
          await supabase.from('profiles').update({ wallet_credits: profile.wallet_credits - 5 }).eq('user_id', session.user.id);
        } else {
          alert('You have reached the free post limit. Upgrade to post more or top up your wallet (Costs 5 credits).');
          navigate('/wallet/topup');
          return;
        }
      }
    }

    const { error } = await supabase.from('posts').insert([
      { user_id: session.user.id, content: postContent, IsMediaPublic: true }
    ]);

    if (!error) {
      setPostContent('');
      setShowPostModal(false);
      fetchData(session.user.id);
    } else {
      console.error(error);
    }
  };

  const handleSaveCard = () => {
    alert('Player card saved successfully!');
    setShowCardModal(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8 sm:gap-10">
      <Helmet>
        <title>Athlete Feed & Scout Dashboard - FSMEC</title>
        <meta name="description" content="View recruiter evaluation reports, athletic stats, player cards, and public highlights on FSMEC." />
        <meta property="og:title" content="Athlete Feed & Scout Dashboard - FSMEC" />
        <meta property="og:description" content="View recruiter evaluation reports, athletic stats, player cards, and public highlights on FSMEC." />
      </Helmet>
      
      {/* Upgrade Banner */}
      {!profile?.is_upgraded && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-blue-900">
            <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <div className="font-bold text-sm sm:text-base">Upgrade Now</div>
              <div className="text-xs sm:text-sm opacity-80">Unlock AI Player Cards & Live Streaming!</div>
            </div>
          </div>
          <Link to="/plans/subscription" className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-blue-700 transition-colors text-center">
            View Plans
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 border-b border-gray-100 pb-8">
        <Link to={`/player/${profile?.IdNumber}`} className="flex flex-col sm:flex-row items-center gap-4 hover:opacity-80 transition-opacity text-center sm:text-left">
          <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200"></div>}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{profile?.full_name || 'Athlete'}</h1>
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">View Public Profile &rarr;</div>
          </div>
        </Link>

        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
          <button 
            aria-label="Create Player Card"
            onClick={() => {
              if (!profile?.is_upgraded && !localStorage.getItem(`claimed_follow_${session?.user?.id}`)) {
                alert('You must follow us on Instagram to create a player card for free. Go to your Profile -> Offers to claim it!');
                return;
              }
              setShowCardModal(true);
            }}
            className="flex items-center justify-center gap-2 bg-gray-100 text-black border border-gray-200 px-4 py-2.5 rounded-full text-[10px] font-black uppercase hover:bg-gray-200 transition-colors"
          >
            <IdCard className="w-4 h-4" />
            Card
          </button>
          <button 
            aria-label="Generate AI Card"
            onClick={() => {
              if ((profile?.wallet_credits || 0) < 5) {
                alert('You need $5 wallet credits to use AI Generation. Claim it in Offers or upgrade your plan.');
                return;
              }
              navigate(`/player/card/${profile?.IdNumber}?ai=true`);
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-full text-[10px] font-black uppercase hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            AI Card
          </button>
          {profile?.is_upgraded && (
            <Link 
              to="/live/start"
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-full text-[10px] font-black uppercase hover:bg-red-100 transition-colors"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              Go Live
            </Link>
          )}
        </div>
      </div>

      {/* Feedbacks Table */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Feedbacks Received</h2>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-600">Name</th>
                <th className="px-6 py-4 font-medium text-gray-600">Date</th>
                <th className="px-6 py-4 font-medium text-gray-600">Feedback Type</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    You have no feedbacks yet.
                  </td>
                </tr>
              ) : (
                feedbacks.map(f => (
                  <tr key={f.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{f.sender_name || 'Anonymous Scout'}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(f.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        {f.type || 'General'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Posts Section */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Your Posts</h2>
          <button 
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Post
          </button>
        </div>

        {posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map(p => (
              <Link 
                key={p.id} 
                to={`/post/${p.id}`}
                className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{profile?.full_name || 'Athlete'}</div>
                    <div className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm line-clamp-3">{p.content}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-xl font-bold">Create a New Post</h3>
            <textarea 
              rows={5}
              placeholder="What's on your mind?"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black resize-none"
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setShowPostModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleCreatePost} className="px-5 py-2.5 rounded-xl font-medium bg-black text-white hover:bg-gray-800">Post</button>
            </div>
          </div>
        </div>
      )}

      {/* Player Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl flex flex-col gap-6">
            <h3 className="text-xl font-bold text-center">Customize Player Card</h3>
            
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 text-white shadow-lg flex flex-col gap-4 border border-gray-800">
              <div className="flex justify-between items-start border-b border-gray-700 pb-4">
                <div>
                  <h4 className="text-xl font-bold tracking-tight">{profile?.full_name}</h4>
                  <p className="text-gray-400 text-sm uppercase tracking-wider mt-1">{profile?.position || 'Athlete'}</p>
                </div>
                {profile?.avatar_url && (
                  <img src={profile.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-gray-700" />
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mt-2">
                <div className="bg-gray-800/50 rounded-xl p-2">
                  <div className="text-xs text-gray-400">Stat 1</div>
                  <div className="font-bold text-lg">{cardStats.stat1 || '-'}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-2">
                  <div className="text-xs text-gray-400">Stat 2</div>
                  <div className="font-bold text-lg">{cardStats.stat2 || '-'}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-2">
                  <div className="text-xs text-gray-400">Stat 3</div>
                  <div className="font-bold text-lg">{cardStats.stat3 || '-'}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Stat 1 Value (e.g. 99 SPD)" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cardStats.stat1} onChange={e => setCardStats({...cardStats, stat1: e.target.value})} />
              <input type="text" placeholder="Stat 2 Value (e.g. 85 AGI)" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cardStats.stat2} onChange={e => setCardStats({...cardStats, stat2: e.target.value})} />
              <input type="text" placeholder="Stat 3 Value (e.g. 92 STR)" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cardStats.stat3} onChange={e => setCardStats({...cardStats, stat3: e.target.value})} />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setShowCardModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSaveCard} className="px-5 py-2.5 rounded-xl font-medium bg-black text-white hover:bg-gray-800">Save Card</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
