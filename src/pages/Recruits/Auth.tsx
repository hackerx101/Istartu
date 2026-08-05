import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Briefcase, User, Mail, Lock, Camera } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function RecruitsAuth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    organization: '',
    avatar_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
        
        // Check if role is recruit
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
            if (profile && profile.role !== 'recruit') {
              await supabase.auth.signOut();
              throw new Error('This account is not a recruiter account.');
            }
          } catch (e: any) {
            if (e?.message?.includes('recruiter')) throw e;
          }
          navigate('/recruits/dashboard');
        }
      } else {
        if (!formData.avatar_url) {
           alert("Please upload a profile photo (It must clearly show your face).");
           setLoading(false);
           return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        });
        
        if (error) throw error;
        if (data.user) {
          const IdNumber = Math.floor(100000 + Math.random() * 900000).toString();
          const teamId = 'TEAM_' + Math.random().toString(36).substring(2, 9).toUpperCase();
          
          await supabase.from('profiles').insert([{
            user_id: data.user.id,
            email: formData.email,
            full_name: formData.fullName,
            IdNumber,
            role: 'recruit',
            team_id: teamId,
            bio: formData.organization,
            avatar_url: formData.avatar_url
          }]);
          
          navigate('/recruits/dashboard');
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <Helmet><title>{isLogin ? 'Login' : 'Signup'} - Recruiter Portal</title></Helmet>
      
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">{isLogin ? 'Recruiter Login' : 'Recruiter Signup'}</h2>
          <p className="text-sm text-gray-500">Access the FSMEC Scouting Network</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  required 
                  placeholder="Full Name" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black"
                />
              </div>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  required 
                  placeholder="Organization/Team Name" 
                  value={formData.organization}
                  onChange={e => setFormData({...formData, organization: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black"
                />
              </div>
              <div className="relative">
                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="url" 
                  required 
                  placeholder="Profile Photo URL (Must show your face)" 
                  value={formData.avatar_url}
                  onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="email" 
              required 
              placeholder="Work Email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="password" 
              required 
              placeholder="Password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors mt-2"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login to Portal' : 'Create Recruiter Account')}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gray-500 font-medium hover:text-black transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
