import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password recovery email sent. Check your inbox.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6">
      <div className="w-full max-w-[400px] bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>
        <p className="text-center text-sm text-gray-500 mb-8">Enter your email and we'll send you a link to reset your password.</p>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm">{message}</div>}
        
        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white rounded-xl py-3.5 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Sending...' : 'Send Recovery Email'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Remember your password? <Link to="/auth/login" className="text-black font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
