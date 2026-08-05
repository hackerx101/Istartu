import React, { useState } from 'react';
import { Bot, Send, X, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

export default function AIFab({ isUpgraded, plan }: { isUpgraded: boolean, plan: string }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([{role: 'ai', content: 'Hello! Ask me to write summaries, analyze players, or create writeups.'}]);
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState('');

  if (!isUpgraded) return null; // AI is only for upgraded users

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (plan === 'Starter' && imageBase64) {
        alert("Starter plan only allows 1 image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim() && !imageBase64) return;

    const userMessage = prompt;
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
        setMessages(prev => [...prev, { role: 'ai', content: 'Error generating response.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection failed.' }]);
    }
    
    setLoading(false);
    setImageBase64(''); // clear image after send
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50">
      {open && (
        <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-80 md:w-96 h-96 mb-4 flex flex-col overflow-hidden">
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold">
              <Bot className="w-5 h-5" /> AI Assistant
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-300 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={clsx("p-3 rounded-xl max-w-[85%] text-sm", m.role === 'user' ? "bg-black text-white self-end" : "bg-white border border-gray-200 text-gray-800 self-start")}>
                {m.content}
              </div>
            ))}
            {loading && <div className="p-3 rounded-xl max-w-[85%] text-sm bg-white border border-gray-200 text-gray-800 self-start flex items-center gap-2"><Bot className="w-4 h-4 animate-bounce" /> Thinking...</div>}
          </div>

          <div className="p-3 bg-white border-t border-gray-200 flex flex-col gap-2">
            {imageBase64 && (
              <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                <img src={imageBase64} className="w-full h-full object-cover" />
                <button onClick={() => setImageBase64('')} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black"><X className="w-3 h-3"/></button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <label className="text-gray-400 hover:text-black cursor-pointer p-2">
                <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                <ImageIcon className="w-5 h-5" />
              </label>
              <input 
                type="text" 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask something..."
                className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 outline-none focus:bg-gray-200"
              />
              <button onClick={handleSend} disabled={loading} className="text-white bg-black p-2 rounded-full hover:bg-gray-800 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <Bot className="w-6 h-6" />
      </button>
    </div>
  );
}
