"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { getUserConversations } from "../actions";
import Link from "next/link";
import { MessageSquare, ArrowRight, Clock } from "lucide-react";

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setLoading(false);
    });
  }, [supabase.auth]);

  useEffect(() => {
    if (user) {
      getUserConversations(user.id).then(convos => {
        setConversations(convos);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return <div className="max-w-2xl mx-auto py-24 text-center text-neutral-400">Loading messages...</div>;
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

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight text-white mb-2">Messages</h1>
        <p className="text-neutral-400">Coordinate returns with verified matches safely and anonymously.</p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
          <MessageSquare className="w-12 h-12 text-neutral-600 mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">No active conversations</h2>
          <p className="text-neutral-500 max-w-sm mx-auto">
            When you verify ownership of a match, your conversation with the other party will appear here.
          </p>
          <Link href="/dashboard" className="mt-6 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-neutral-200 transition-colors inline-flex items-center gap-2">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {conversations.map(conv => {
            const lastMessage = conv.messages[0];
            const isMeLost = conv.user1Id === user.id; // user1 is lost item owner
            const otherPartyRole = isMeLost ? "Finder" : "Owner";
            const itemTitle = conv.match.lostItem.name || conv.match.lostItem.category;

            return (
              <Link 
                key={conv.id} 
                href={`/chat/${conv.matchId}`}
                className="bg-neutral-900/50 border border-white/10 hover:border-white/30 rounded-2xl p-6 transition-colors flex items-center gap-6 group"
              >
                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white truncate">
                      Chat with {otherPartyRole} • <span className="text-neutral-400 font-normal">{itemTitle}</span>
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-neutral-500 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(lastMessage.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-neutral-400 truncate">
                    {lastMessage 
                      ? `${lastMessage.senderId === user.id ? "You: " : ""}${lastMessage.content}`
                      : "No messages yet. Start the conversation!"}
                  </p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
