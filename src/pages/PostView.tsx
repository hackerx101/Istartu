import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, MessageCircle, Share2, Heart, Send } from 'lucide-react';

export default function PostView() {
  const { PostId } = useParams();
  const navigate = useNavigate();
  const { session, profile: currentUserProfile } = useOutletContext<any>();
  
  const [post, setPost] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(12);
  const [hasLiked, setHasLiked] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPostAndComments = async () => {
    if (PostId) {
      let postData = null;
      try {
        const res = await supabase.from('posts').select('*').eq('id', PostId).single();
        if (res.data && !res.error) postData = res.data;
      } catch (e) {
        console.warn("Post fetch error:", e);
      }

      if (!postData) {
        setLoading(false);
        return;
      }
      setPost(postData);

      let authorData = null;
      try {
        const resA = await supabase.from('profiles').select('*').eq('user_id', postData.user_id).single();
        if (resA.data && !resA.error) authorData = resA.data;
      } catch (e) {
        console.warn("Author profile query error:", e);
      }

      setAuthor(authorData || { full_name: 'Athlete' });

      // Load comments from collection
      try {
        const resC = await supabase.from('comments').select('*').eq('post_id', PostId).order('created_at', { ascending: true });
        if (resC.data) {
          setComments(resC.data);
        }
      } catch (e) {
        console.warn("Comments load error:", e);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchPostAndComments();
  }, [PostId]);

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      const newComment = {
        post_id: PostId,
        user_id: session?.user?.id || 'anonymous_user',
        content: commentText.trim(),
        author_name: currentUserProfile?.full_name || session?.user?.email?.split('@')[0] || 'Anonymous Fan',
        author_avatar: currentUserProfile?.avatar_url || '',
        created_at: new Date().toISOString()
      };

      await supabase.from('comments').insert([newComment]);
      setCommentText('');
      
      // Reload comments list
      const resC = await supabase.from('comments').select('*').eq('post_id', PostId).order('created_at', { ascending: true });
      if (resC.data) {
        setComments(resC.data);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!post) return <div className="p-8 text-center text-gray-500">Post not found.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12 flex flex-col gap-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black self-start">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 mt-4">
        {/* Post Author info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
            {author?.avatar_url || author?.profile_photo ? (
              <img src={author.avatar_url || author.profile_photo} alt={author.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{author?.full_name || 'Athlete'}</h3>
            <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Interaction buttons */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-gray-500">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${hasLiked ? 'text-red-500 font-bold' : 'hover:text-black'}`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} /> 
            <span className="text-sm font-medium">{likesCount} Likes</span>
          </button>
          
          <div className="flex items-center gap-2 text-gray-900 font-medium">
            <MessageCircle className="w-5 h-5 text-gray-500" /> 
            <span className="text-sm">{comments.length} Comments</span>
          </div>

          <button className="flex items-center gap-2 hover:text-black transition-colors">
            <Share2 className="w-5 h-5" /> 
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-100 pt-6 mt-2 space-y-6">
          <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider">Comments</h4>
          
          {/* List existing comments */}
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No comments yet. Be the first to cheer them on!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((cmt) => (
                <div key={cmt.id} className="flex gap-3 bg-gray-50/55 p-3.5 rounded-2xl border border-gray-100/50">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                    {cmt.author_avatar ? (
                      <img src={cmt.author_avatar} alt={cmt.author_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xs text-gray-950">{cmt.author_name}</span>
                      <span className="text-[10px] text-gray-400">{cmt.created_at ? new Date(cmt.created_at).toLocaleDateString() : ''}</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-normal">{cmt.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add a comment form */}
          {session ? (
            <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
              <input
                type="text"
                placeholder="Write a supportive comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-black text-sm transition-all"
                disabled={submittingComment}
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="bg-black hover:bg-gray-800 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-1.5 font-bold text-xs transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
              <p className="text-xs text-gray-500">
                Please <Link to="/auth/login" className="text-black font-bold underline">Login</Link> to join the discussion and post comments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
