"use client";

import { getMessages, sendMessage } from "../../actions";
import { Send, ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function ChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setLoading(false);
    });
  }, [supabase.auth]);

  useEffect(() => {
    if (user) {
      getMessages(matchId)
        .then(msgs => {
          setMessages(msgs);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }
  }, [matchId, user]);

  if (loading) {
    return <div className="max-w-2xl mx-auto py-24 text-center text-neutral-400">Loading conversation...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <h1 className="text-3xl font-medium tracking-tight text-white mb-4">Login Required</h1>
        <p className="text-neutral-400 mb-8">You must be logged in to view your messages.</p>
        <Link href="/auth/login" className="px-6 py-3 bg-white text-black rounded-lg font-medium inline-block hover:bg-neutral-200 transition-colors">
          Log In or Sign Up
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <p className="text-neutral-400">Unable to load conversation. Ensure the claim is verified.</p>
        <Link href="/dashboard" className="text-sm underline mt-4 text-white block">Return to Dashboard</Link>
      </div>
    );
  }

  async function handleSend(formData: FormData) {
    if (!user) return;
    const content = formData.get("content") as string;
    if (!content.trim()) return;
    
    // Optimistic UI could be added here
    await sendMessage(matchId, user.id, content);
    
    // Refresh messages
    const msgs = await getMessages(matchId);
    setMessages(msgs);
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/40">
        <Link href="/messages" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h2 className="font-medium text-white flex items-center gap-2">
            Secure Chat <Shield className="w-4 h-4 text-emerald-500" />
          </h2>
          <p className="text-xs text-neutral-400">Both parties are protected. Discuss meetup details safely.</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500">
            <Shield className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">No messages yet. Send a message to coordinate.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-5 py-3 rounded-2xl ${isMe ? 'bg-white text-black rounded-br-sm' : 'bg-neutral-800 border border-white/10 text-white rounded-bl-sm shadow-sm'}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 border-t border-white/10">
        <form action={handleSend} className="flex gap-3">
          <input 
            type="text" 
            name="content"
            required
            autoComplete="off"
            placeholder="Type your message..." 
            className="flex-1 px-5 py-3 rounded-xl border border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition-all bg-black/50 text-white"
          />
          <button type="submit" className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-xl hover:bg-neutral-200 transition-colors shrink-0">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
