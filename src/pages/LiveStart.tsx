import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Radio, Users, Copy, CheckCircle, Video, UserPlus, Gift, Send, Mic, MicOff, Camera as CameraIcon, CameraOff, Settings, Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';

export default function LiveStart() {
  const context = useOutletContext<any>() || {};
  const { profile, subscription } = context;
  const [isLive, setIsLive] = useState(false);
  const [broadcastMode, setBroadcastMode] = useState<'practice' | 'live'>('practice');
  const [saveVod, setSaveVod] = useState(true);
  const [liveId, setLiveId] = useState('');
  const [copied, setCopied] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chats, setChats] = useState<{user: string, message: string, isGift?: boolean}[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const channelRef = useRef<any>(null);

  const isUpgraded = subscription?.is_upgraded === true;

  // Enumerate devices on mount
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devs.filter(d => d.kind === 'videoinput');
        setDevices(videoDevs);
        if (videoDevs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevs[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };
    getDevices();
  }, []);

  // Stop stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [stream]);

  const handleStartLive = async () => {
    const id = 'LIVE_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setLiveId(id);
    setIsLive(true);
    setError(null);
    setChats([]);

    try {
      const constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: cameraFacing },
        audio: true
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Initialize Realtime Chat
      if (broadcastMode === 'live') {
        const channel = supabase.channel(`live:${id}`, {
          config: {
            broadcast: { self: true },
          },
        });

        channel
          .on('broadcast', { event: 'chat' }, ({ payload }) => {
            setChats(prev => [...prev, payload]);
          })
          .subscribe();
        
        channelRef.current = channel;
      }

      // Initialize VOD Recording
      if (saveVod) {
        chunksRef.current = [];
        const recorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp8,opus' });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = async () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            // In a real app, you would upload this to Supabase Storage:
            // await supabase.storage.from('vods').upload(`${id}.webm`, blob);
            console.log("VOD recorded, size:", blob.size);
            
            // For now, let's trigger a local download as a "VOD saved" confirmation
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vod_${id}.webm`;
            a.click();
          }
        };
        recorder.start(1000); // chunk every second
        mediaRecorderRef.current = recorder;
      }

    } catch (err: any) {
      console.error("Camera/Mic error:", err);
      setError("Unable to access camera or microphone. Please check your browser permissions.");
      setIsLive(false);
    }
  };

  const toggleCameraFacing = async () => {
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);
    setSelectedDeviceId(''); // clear selected device to allow facingMode to take over
    
    if (isLive && stream) {
      // Restart stream with new facing mode
      stream.getTracks().forEach(track => track.stop());
      try {
        const constraints = {
          video: { facingMode: newFacing },
          audio: micEnabled
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error switching camera:", err);
      }
    }
  };

  const handleEndLive = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setIsLive(false);
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCam = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setCamEnabled(!camEnabled);
    }
  };

  const handleCopyLink = () => {
    if (liveId) {
      navigator.clipboard.writeText(`${window.location.origin}/live/invite/${liveId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const newMsg = { 
      user: profile?.full_name || 'Host', 
      message: chatMessage,
      timestamp: new Date().toISOString()
    };

    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'chat',
        payload: newMsg,
      });
    } else {
      // In practice mode or if channel not ready, just add locally
      setChats(prev => [...prev, newMsg]);
    }

    setChatMessage('');
  };

  const handleInvite = () => {
    alert("Invite sent! Coaches will receive a notification in their dashboard to accept and join the live feed.");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8 h-[calc(100vh-80px)]">
      <Helmet><title>Live Studio - FSMEC</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Radio className="w-6 h-6 text-red-500 animate-pulse" /> Live Broadcast Studio
        </h1>
        <div className="flex items-center gap-3">
          <select 
            value={broadcastMode} 
            onChange={(e) => setBroadcastMode(e.target.value as any)}
            className="bg-white border border-gray-200 text-sm font-bold rounded-full px-4 py-1.5 outline-none focus:border-red-500 shadow-sm transition-colors"
            disabled={isLive}
          >
            <option value="practice">Practice Mode</option>
            <option value="live">Live Mode</option>
          </select>
          {broadcastMode === 'practice' ? (
            <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full font-black uppercase tracking-widest">
              Private
            </span>
          ) : (
            <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full font-black uppercase tracking-widest">
              Public
            </span>
          )}
        </div>
      </div>

      {!isLive ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-3xl h-auto min-h-[60vh] gap-6 bg-gray-50 p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-md">
            <Video className="w-10 h-10 text-red-500" />
          </div>
          <div className="text-center max-w-sm">
            <h2 className="text-xl font-bold">
              {broadcastMode === 'practice' ? 'Practice Mode' : 'Go Live Now'}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {broadcastMode === 'practice' 
                ? 'Test your camera and techniques privately. No one else can see this stream and no data is broadcasted.' 
                : 'Broadcast your training sessions or invite coaches for live interviews using real-time streaming.'}
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Settings</label>
              
              {/* Camera Selection */}
              <div className="flex flex-col gap-2">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                  <CameraIcon className="w-3 h-3" /> Select Camera
                </div>
                <select 
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-red-500 transition-colors"
                >
                  {devices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                  ))}
                  {devices.length === 0 && <option value="">Default Camera</option>}
                </select>
              </div>

              {/* VOD Toggle */}
              <button 
                onClick={() => setSaveVod(!saveVod)}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${saveVod ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900">Save as VOD</div>
                    <div className="text-[10px] text-gray-500">Record and save for replay</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${saveVod ? 'bg-green-500' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${saveVod ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <button onClick={handleStartLive} className={`w-full py-4 ${broadcastMode === 'practice' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}>
                <Radio className="w-5 h-5" />
                {broadcastMode === 'practice' ? 'Enter Practice' : 'Start Broadcast'}
              </button>
              <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">
                Camera & Mic permissions required
              </p>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs font-bold mt-2">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[60vh]">
          {/* Main Video Area */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex items-center justify-center group">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'transform -scale-x-100' : ''}`}
              />
              
              <div className={`absolute top-4 left-4 ${broadcastMode === 'practice' ? 'bg-blue-600' : 'bg-red-600'} text-white px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase flex items-center gap-2 z-10 shadow-lg`}>
                <span className={`w-2 h-2 bg-white rounded-full ${broadcastMode === 'live' ? 'animate-pulse' : ''}`}></span> 
                {broadcastMode === 'practice' ? 'PRACTICE' : 'LIVE'}
              </div>
              
              {broadcastMode === 'live' && (
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-md text-xs font-medium flex items-center gap-2 z-10">
                  <Users className="w-4 h-4 text-red-400" /> 0 viewers
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-white/10">
                <button onClick={toggleMic} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" title="Toggle Mic">
                  {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-red-400" />}
                </button>
                <button onClick={toggleCam} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" title="Toggle Camera">
                  {camEnabled ? <CameraIcon className="w-5 h-5" /> : <CameraOff className="w-5 h-5 text-red-400" />}
                </button>
                <button onClick={toggleCameraFacing} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" title="Flip Camera">
                  <Radio className="w-5 h-5 rotate-90" />
                </button>
                <button onClick={handleEndLive} className={`px-6 py-2 ${broadcastMode === 'practice' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'} rounded-full text-white font-bold transition-colors`}>
                  {broadcastMode === 'practice' ? 'Exit Practice' : 'End Stream'}
                </button>
              </div>

              {/* Tiles for Guests (Mock) */}
              <div className="absolute top-16 right-4 w-32 flex flex-col gap-3">
                {/* empty tiles ready for guests */}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Invite Coaches & Players</h3>
                  <p className="text-sm text-gray-500">Share this link to let others join your live stream split-screen.</p>
                </div>
                <button 
                  onClick={handleInvite}
                  className="bg-blue-50 text-blue-600 p-3 rounded-full hover:bg-blue-100 transition-colors"
                  title="Invite directly"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <div className="flex-1 px-3 text-sm font-mono truncate text-gray-600">
                  {window.location.origin}/live/invite/{liveId}
                </div>
                <button 
                  onClick={handleCopyLink}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Chat & Interactions Sidebar */}
          <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-3xl flex flex-col shadow-sm overflow-hidden h-[500px] lg:h-auto">
            <div className="p-4 border-b border-gray-100 font-bold flex justify-between items-center">
              <span>Live Chat</span>
              <span className={`text-[10px] px-2 py-1 rounded-md uppercase tracking-widest ${broadcastMode === 'live' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                {broadcastMode === 'live' ? 'Connected' : 'Offline'}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50">
              {chats.map((chat, i) => (
                <div key={i} className={`flex flex-col ${chat.isGift ? 'bg-yellow-50 border border-yellow-200 p-2 rounded-lg' : ''}`}>
                  {chat.isGift && <div className="text-yellow-600 text-xs font-bold mb-1 flex items-center gap-1"><Gift className="w-3 h-3" /> GIFT RECEIVED</div>}
                  <div className="text-sm">
                    <span className="font-bold text-gray-900 mr-2">{chat.user}:</span>
                    <span className="text-gray-700">{chat.message}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendChat} className="p-4 border-t border-gray-100 flex gap-2 bg-white">
              <input 
                type="text" 
                placeholder="Say something..." 
                className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2 text-sm outline-none focus:bg-white focus:border-gray-300 border transition-colors"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
              />
              <button type="submit" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 flex-shrink-0">
                <Send className="w-4 h-4 ml-[-2px]" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
