import React, { useState } from 'react';
import { Bot, Send, X, Image as ImageIcon, Sparkles, Minus, Maximize2 } from 'lucide-react';
import clsx from 'clsx';

export default function AIFab({ isUpgraded, plan }: { isUpgraded?: boolean, plan?: string }) {
  const [open, setOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    {
      role: 'ai', 
      content: '🏀⚽ **Welcome to FSMEC AI Skills & Drills Coach!**\nAsk me about custom training routines, shooting mechanics, footwork drills, speed workouts, or player web scouting summaries.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState('');

  const quickPills = [
    "🏀 Basketball Shooting Drills",
    "⚡ Ball Handling & Footwork",
    "⚽ Soccer Passing & Touch",
    "🏃 Speed & Agility Routine"
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() && !imageBase64) return;

    const userMessage = queryText;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage, imageBase64 })
      });
      const data = await res.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Error generating response. Please try again.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection issue. Make sure your server is active.' }]);
    }
    
    setLoading(false);
    setImageBase64('');
  };

  const handleSend = () => sendQuery(prompt);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div 
          className={clsx(
            "bg-white border border-gray-200 shadow-2xl rounded-3xl w-80 sm:w-96 transition-all duration-200 mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4",
            isMinimized ? "h-14" : "h-[480px]"
          )}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white p-3.5 flex justify-between items-center shadow-md select-none">
            <div 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="flex items-center gap-2 font-black text-xs cursor-pointer flex-1"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div>AI Skills & Drills Coach</div>
                <div className="text-[9px] text-gray-400 font-normal">FSMEC Athletic & Web Analyst</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsMinimized(!isMinimized)} 
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => { setOpen(false); setIsMinimized(false); }} 
                title="Close"
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50">
                {messages.map((m, i) => (
                  <div key={i} className={clsx("p-3.5 rounded-2xl max-w-[90%] text-xs whitespace-pre-line leading-relaxed shadow-sm", m.role === 'user' ? "bg-black text-white self-end rounded-br-none" : "bg-white border border-gray-100 text-gray-800 self-start rounded-bl-none")}>
                    {m.content}
                  </div>
                ))}
                {loading && (
                  <div className="p-3 rounded-2xl max-w-[85%] text-xs bg-white border border-gray-100 text-gray-600 self-start flex items-center gap-2">
                    <Bot className="w-4 h-4 animate-bounce text-blue-500" /> AI Coach is searching & analyzing...
                  </div>
                )}
              </div>

              {/* Quick Drill Chips */}
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {quickPills.map((pill, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendQuery(pill)}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-700 whitespace-nowrap hover:bg-black hover:text-white hover:border-black transition-all shadow-xs"
                  >
                    {pill}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-2">
                {imageBase64 && (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200">
                    <img src={imageBase64} className="w-full h-full object-cover" />
                    <button onClick={() => setImageBase64('')} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"><X className="w-3 h-3"/></button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 hover:text-black cursor-pointer p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                    <ImageIcon className="w-4 h-4" />
                  </label>
                  <input 
                    type="text" 
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask AI Coach or search player..."
                    className="flex-1 text-xs bg-gray-100 rounded-full px-4 py-2.5 outline-none focus:bg-gray-200 font-medium"
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={loading} 
                    className="text-white bg-black p-2.5 rounded-full hover:bg-gray-800 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <button 
        onClick={() => {
          if (open && isMinimized) {
            setIsMinimized(false);
          } else {
            setOpen(!open);
            setIsMinimized(false);
          }
        }}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 group"
        title="AI Skills & Drills Coach"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}
