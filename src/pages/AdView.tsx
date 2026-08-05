import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function AdView() {
  const { PostId } = useParams();
  const [post, setPost] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (PostId) {
      fetchPost();
    }
  }, [PostId]);

  const fetchPost = async () => {
    setLoading(true);
    let p = null;
    try {
      const res = await supabase.from('posts').select('*').eq('id', PostId).single();
      if (res.data && !res.error) p = res.data;
    } catch (e) {
      console.warn("Ad fetch error:", e);
    }

    if (!p) {
      setPost(null);
      setLoading(false);
      return;
    }
    setPost(p);

    let a = null;
    try {
      const resA = await supabase.from('profiles').select('*').eq('user_id', p.user_id).single();
      if (resA.data && !resA.error) a = resA.data;
    } catch (e) {
      console.warn("Author query error in AdView:", e);
    }

    setAuthor(a || { full_name: 'Partner' });
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Ad...</div>;

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <h2 className="text-2xl font-bold">Ad Not Found</h2>
        <Link to="/" className="mt-6 bg-black text-white px-6 py-2 rounded-lg font-medium">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 flex flex-col gap-8">
      <Helmet>
        {/* SEO tags for the Ad */}
        <title>{post.content.substring(0, 30)}... - Promoted on FSMEC</title>
        <meta name="description" content={post.content.substring(0, 150)} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-8 flex flex-col gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-yellow-200 text-yellow-800 text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-bl-xl">
          Promoted Ad
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-full overflow-hidden border border-yellow-200">
            {author?.avatar_url ? (
              <img src={author.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900">{author?.full_name || 'Organization'}</div>
            <div className="text-sm text-yellow-700">{author?.bio || 'Recruiter'}</div>
          </div>
        </div>

        <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-yellow-200/50">
          <div className="text-xs text-yellow-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> SEO Indexed
          </div>
          <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}
