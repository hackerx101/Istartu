import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Camera } from 'lucide-react';
import { setIstartuSharedSession } from '../../lib/authSession';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'player' | 'recruit'>('player');
  const [sport, setSport] = useState('Basketball');
  const [position, setPosition] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Date of Birth check (min age 10)
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 10) {
      setError("You must be at least 10 years old to sign up.");
      return;
    }

    setError('');
    setStep(2);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    
    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Create Profile (using ONLY full_name, sport, and valid non-null columns)
      const IdNumber = '100' + Math.floor(10000 + Math.random() * 90000).toString();
      const createdAt = new Date().toISOString();
      const profileData = {
        id: authData.user.id,
        user_id: authData.user.id,
        IdNumber: IdNumber,
        full_name: fullName.trim() || 'Athlete',
        role: role || 'player',
        dob: dob || '2005-01-01',
        bio: bio.trim() || 'No bio provided',
        position: position.trim() || 'Athlete',
        sport: sport.trim() || 'Basketball',
        avatar_url: photoBase64 || '',
        is_public: true,
        is_upgraded: false,
        wallet_credits: 0,
        created_at: createdAt
      };

      const { error: profileError } = await supabase.from('profiles').insert([profileData]);

      // Save to shared session and localStorage regardless so user session is stored
      setIstartuSharedSession({ user: authData.user }, profileData);
      localStorage.setItem('demo_profile', JSON.stringify(profileData));

      if (profileError) {
        console.warn("Profile creation database note:", profileError);
        // Fallback: If DB table insert fails due to constraint or column mismatch, proceed with session
      }

      setTimeout(() => {
        navigate('/home');
      }, 400);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 w-full">
      <div className="w-full max-w-[480px] bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 shadow-sm">
        
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}
            
            <form onSubmit={handleNext} className="flex flex-col gap-4">
              
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-3 mb-4">
                <div 
                  className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 cursor-pointer relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoBase64 ? (
                    <img src={photoBase64} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium">Upload</span>
                  </div>
                </div>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handlePhotoUpload} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input required type="text" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <input required type="date" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none" value={dob} onChange={e => setDob(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input required type="email" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input required type="password" minLength={6} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <input required type="password" minLength={6} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Account Role</label>
                  <select className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none bg-white" value={role} onChange={e => setRole(e.target.value as 'player' | 'recruit')}>
                    <option value="player">Athlete / Player</option>
                    <option value="recruit">Scout / Recruiter</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Sport</label>
                  <input required type="text" placeholder="e.g. Basketball, Football, Track" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none" value={sport} onChange={e => setSport(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Position</label>
                <input required type="text" placeholder="e.g. Forward, Point Guard, Quarterback" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none" value={position} onChange={e => setPosition(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea required rows={3} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black outline-none resize-none" value={bio} onChange={e => setBio(e.target.value)} />
              </div>

              <button type="submit" className="w-full bg-black text-white rounded-xl py-3.5 font-medium hover:bg-gray-800 mt-4">
                Continue
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account? <Link to="/auth/login" className="text-black font-medium hover:underline">Log in</Link>
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center">Terms of Service</h2>
            
            <div className="bg-gray-50 p-6 rounded-2xl h-64 overflow-y-auto text-sm text-gray-600 leading-relaxed border border-gray-100">
              <p className="font-medium text-gray-900 mb-2">Important Notice Regarding Data Sharing</p>
              <p className="mb-4">
                Please be aware that your data may be shared with sports companies for advertisements and promotional offers. 
                By proceeding, you acknowledge and agree to this practice.
              </p>
              <p>
                By creating an account, you agree to our <Link to="/tos" target="_blank" className="text-blue-600 hover:underline">Terms of Service</Link> and our <Link to="/privacy" target="_blank" className="text-blue-600 hover:underline">Privacy Policy</Link>.
              </p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3.5 font-medium hover:bg-gray-200"
              >
                Back
              </button>
              <button 
                onClick={handleSignup}
                disabled={loading}
                className="flex-1 bg-black text-white rounded-xl py-3.5 font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'I Agree'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
