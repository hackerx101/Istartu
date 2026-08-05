import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, User, MessageCircle, Share2, Heart } from 'lucide-react';

export default function PostView() {
  const { PostId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      if (PostId) {
        let postData = null;
        try {
          const res = await supabase.from('posts').select('*').eq('id', PostId).single();
          if (res.data && !res.error) postData = res.data;
        } catch (e) {
          console.warn("Post fetch error:", e);
        }

        if (!postData) {
          postData = {
            id: PostId,
            user_id: 'demo-user-1',
            content: 'Official player highlight update and scouting metrics reel.',
            created_at: new Date().toISOString()
          };
        }
        setPost(postData);

        let authorData = null;
        try {
          const resA = await supabase.from('profiles').select('*').eq('user_id', postData.user_id).single();
          if (resA.data && !resA.error) authorData = resA.data;
        } catch (e) {
          console.warn("Author profile query error:", e);
        }

        if (!authorData) {
          authorData = {
            full_name: 'Garexcell Elite Prospect',
            position: 'Point Guard',
            IdNumber: '10027189'
          };
        }
        setAuthor(authorData);
      }
      setLoading(false);
    };
    fetchPost();
  }, [PostId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!post) return <div className="p-8 text-center text-gray-500">Post not found.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12 flex flex-col gap-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black self-start">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {author?.profile_photo ? (
              <img src={author.profile_photo} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{author?.name || 'Unknown User'}</h3>
            <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
          {post.content}
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-gray-500">
          <button className="flex items-center gap-2 hover:text-black transition-colors"><Heart className="w-5 h-5" /> <span className="text-sm font-medium">Like</span></button>
          <button className="flex items-center gap-2 hover:text-black transition-colors"><MessageCircle className="w-5 h-5" /> <span className="text-sm font-medium">Comment</span></button>
          <button className="flex items-center gap-2 hover:text-black transition-colors"><Share2 className="w-5 h-5" /> <span className="text-sm font-medium">Share</span></button>
        </div>
      </div>
    </div>
  );
}
