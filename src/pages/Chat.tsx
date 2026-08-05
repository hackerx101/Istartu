import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageCircle, Lock, AlertCircle, Send, User, CheckCircle2 } from 'lucide-react';

export default function Chat() {
  const { session, profile } = useOutletContext<any>();
  const [searchParams] = useSearchParams();
  const recipientName = searchParams.get('recipient') || '';
  const recipientId = searchParams.get('id') || '';

  const [hasAccess, setHasAccess] = useState(false);
  const [isLimited, setIsLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  const [conversations, setConversations] = useState<any[]>(() => {
    const storageKey = `fsmec_chats_${session?.user?.id || 'demo'}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  const [activeRecipientId, setActiveRecipientId] = useState<string>(recipientId || '');

  useEffect(() => {
    // If query params are present for a recipient, make sure they exist in conversation list
    if (recipientId && recipientName) {
      setConversations(prev => {
        const exists = prev.some(c => c.id === recipientId);
        if (!exists) {
          const updated = [
            {
              id: recipientId,
              name: recipientName,
              position: 'Athlete Prospect',
              messages: [
                { sender: 'them', text: `Hi ${profile?.full_name || 'Scout'}, ready to connect about recruitment opportunities!`, timestamp: 'Just now' }
              ]
            },
            ...prev
          ];
          const storageKey = `fsmec_chats_${session?.user?.id || 'demo'}`;
          localStorage.setItem(storageKey, JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
      setActiveRecipientId(recipientId);
    }
  }, [recipientId, recipientName, profile]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!session) {
        if (localStorage.getItem('demo_mode') === 'true' || profile?.role === 'recruit') {
           setHasAccess(true);
           setLoading(false);
           return;
        }
      }
      if (profile?.role === 'recruit') {
        setHasAccess(true);
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from('subscriptions').select('plan_name, is_upgraded').eq('user_id', session?.user?.id).single();
        if (data && data.is_upgraded) {
          setHasAccess(true);
          if (data.plan_name === 'Essential') setIsLimited(true);
        } else if (localStorage.getItem('demo_mode') === 'true' || profile?.role === 'recruit') {
          setHasAccess(true);
        } else {
          setHasAccess(true); // Allow recruits and players to send messages
        }
      } catch (e) {
        setHasAccess(true);
      }
      setLoading(false);
    };
    checkAccess();
  }, [session, profile]);

  const activeConversation = conversations.find(c => c.id === activeRecipientId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const msgObj = {
      sender: 'me',
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = conversations.map(c => {
      if (c.id === activeConversation.id) {
        return {
          ...c,
          messages: [...c.messages, msgObj]
        };
      }
      return c;
    });

    setConversations(updated);
    setNewMessage('');
    const storageKey = `fsmec_chats_${session?.user?.id || 'demo'}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Automated mock response
    setTimeout(() => {
      const replyObj = {
        sender: 'them',
        text: `Thanks for your message! I've logged this in my athlete recruiting dashboard.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversations(current => {
        const withReply = current.map(c => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              messages: [...c.messages, replyObj]
            };
          }
          return c;
        });
        localStorage.setItem(storageKey, JSON.stringify(withReply));
        return withReply;
      });
    }, 1200);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading messages...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6 min-h-[75vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-black" />
            Recruiter & Athlete Messages
          </h1>
          <p className="text-xs text-gray-500 mt-1">Direct communication portal for recruits, scouts, and players.</p>
        </div>
        {isLimited && (
          <div className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Limited Messaging (Upgrade for Unlimited)
          </div>
        )}
      </div>

      {!hasAccess && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-center justify-between text-xs text-orange-800">
          <span>Upgrade your subscription plan to send unlimited messages.</span>
          <Link to="/plans/subscription" className="font-bold underline">Upgrade Plan</Link>
        </div>
      )}

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm min-h-[500px]">
        
        {/* Left Contact List */}
        <div className="border-r border-gray-100 bg-gray-50/50 p-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Conversations</div>
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[450px]">
            {conversations.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveRecipientId(c.id)}
                className={`p-3 rounded-2xl text-left flex items-center gap-3 transition-colors ${activeRecipientId === c.id ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-800'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${activeRecipientId === c.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {c.name?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{c.name}</div>
                  <div className={`text-xs truncate ${activeRecipientId === c.id ? 'text-gray-300' : 'text-gray-400'}`}>ID: {c.id}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Chat Thread */}
        <div className="md:col-span-2 flex flex-col justify-between bg-white">
          {activeConversation ? (
            <>
              {/* Chat Recipient Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-700">
                    {activeConversation.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      {activeConversation.name}
                      <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                    </h2>
                    <span className="text-xs text-gray-400">Player ID: {activeConversation.id}</span>
                  </div>
                </div>
                <Link to={`/player/${activeConversation.id}`} className="text-xs text-blue-600 font-bold hover:underline">
                  View Profile
                </Link>
              </div>

              {/* Messages Body */}
              <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[360px] min-h-[300px]">
                {activeConversation.messages.map((m: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[80%] ${m.sender === 'me' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.sender === 'me' ? 'bg-black text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                      {m.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{m.timestamp}</span>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Write a message to ${activeConversation.name}...`}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-black text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              Select a contact to view conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

