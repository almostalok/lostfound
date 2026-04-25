"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";

import Link from "next/link";
import { MessageSquare, ShieldCheck } from "lucide-react";

type Match = {
  id: string;
  status: string;
};

type Item = {
  id: string;
  name?: string;
  category: string;
  location_lost?: string;
  location_found?: string;
  date_lost?: Date;
  date_found?: Date;
  description: string;
  created_at: Date;
  userId?: string;
  finderId?: string;
  matches?: Match[];
};

export default function DashboardClient({
  lostItems,
  foundItems,
}: {
  lostItems: Item[];
  foundItems: Item[];
}) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "my" ? "my" : "all";
  const [activeTab, setActiveTab] = useState<"all" | "my">(initialTab);
  const successType = searchParams.get("success");
  const [user, setUser] = useState<User | null>(null);
  const myLostItems = lostItems.filter(item => item.userId === user?.id);
  const myFoundItems = foundItems.filter(item => item.finderId === user?.id);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, [supabase.auth]);

  const renderLostItems = (items: Item[], isMyItems: boolean) => {
    if (items.length === 0) return <p className="text-neutral-500 dark:text-neutral-500 italic">No lost items reported yet.</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 p-6 rounded-3xl hover:border-neutral-300 dark:border-white/20 transition-colors flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-red-500/10 text-red-400 text-xs px-3 py-1 rounded-full font-medium">Lost</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-500">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <h3 className="text-lg font-medium mb-2 text-neutral-900 dark:text-white">{item.name}</h3>
            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-1">
              <div className="flex items-center gap-2"><Tag className="w-4 h-4" /> {item.category}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {item.location_lost}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(item.date_lost!).toLocaleDateString()}</div>
            </div>
            <div className="p-3 bg-white/40 dark:bg-black/40 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-100 dark:border-white/5 mb-4">
              <span className="font-medium text-neutral-900 dark:text-white block mb-1">Description:</span>
              {isMyItems ? item.description : "Description hidden for privacy. Only matched users can view."}
            </div>

            {isMyItems && item.matches && item.matches.length > 0 && (
              <div className="mt-auto space-y-2 pt-4 border-t border-neutral-200 dark:border-white/10">
                <span className="text-xs font-medium text-emerald-400 block mb-2">Match Found!</span>
                {item.matches.map(match => (
                  <div key={match.id}>
                    {match.status === 'pending' && (
                      <Link href={`/verify/${match.id}`} className="w-full flex items-center justify-center gap-2 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">
                        <ShieldCheck className="w-4 h-4" /> Verify Ownership
                      </Link>
                    )}
                    {match.status === 'verified' && (
                      <Link href={`/chat/${match.id}`} className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500 text-neutral-900 dark:text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                        <MessageSquare className="w-4 h-4" /> Message Finder
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderFoundItems = (items: Item[], isMyItems: boolean) => {
    if (items.length === 0) return <p className="text-neutral-500 dark:text-neutral-500 italic">No found items reported yet.</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 p-6 rounded-3xl hover:border-neutral-300 dark:border-white/20 transition-colors flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full font-medium">Found</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-500">{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <h3 className="text-lg font-medium mb-2 text-neutral-900 dark:text-white">{item.category} (Found)</h3>
            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-1">
              <div className="flex items-center gap-2"><Tag className="w-4 h-4" /> {item.category}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {item.location_found}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(item.date_found!).toLocaleDateString()}</div>
            </div>
            <div className="p-3 bg-white/40 dark:bg-black/40 rounded-xl text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-100 dark:border-white/5 mb-4">
              <span className="font-medium text-neutral-900 dark:text-white block mb-1">Description:</span>
              {isMyItems ? item.description : "Description restricted. Claim to securely view details."}
            </div>

            {isMyItems && item.matches && item.matches.length > 0 && (
              <div className="mt-auto space-y-2 pt-4 border-t border-neutral-200 dark:border-white/10">
                <span className="text-xs font-medium text-emerald-400 block mb-2">Match Found!</span>
                {item.matches.map(match => (
                  <div key={match.id}>
                    {match.status === 'pending' && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 py-2 text-center bg-white/5 rounded-lg border border-neutral-100 dark:border-white/5">
                        Waiting for owner to verify.
                      </p>
                    )}
                    {match.status === 'verified' && (
                      <Link href={`/chat/${match.id}`} className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500 text-neutral-900 dark:text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                        <MessageSquare className="w-4 h-4" /> Message Owner
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {successType && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="font-medium">Success!</span>
            {successType === 'lost' && " Your lost item has been reported successfully. Scroll down to see if there are any potential matches!"}
            {successType === 'found' && " Your found item has been reported successfully. The owner will be notified if a match is found!"}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 border-b border-neutral-200 dark:border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "all" ? "text-neutral-900 dark:text-white border-b-2 border-white" : "text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:text-neutral-300"}`}
        >
          All Items
        </button>
        {user && (
          <button 
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "my" ? "text-neutral-900 dark:text-white border-b-2 border-white" : "text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:text-neutral-300"}`}
          >
            My Items
          </button>
        )}
      </div>

      {activeTab === "all" && (
        <div className="space-y-16 animate-in fade-in duration-500">
          <div className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-white/10 pb-4">All Lost Items</h2>
            {renderLostItems(lostItems, false)}
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-white/10 pb-4">All Found Items</h2>
            {renderFoundItems(foundItems, false)}
          </div>
        </div>
      )}

      {activeTab === "my" && user && (
        <div className="space-y-16 animate-in fade-in duration-500">
          <div className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-white/10 pb-4">My Lost Items</h2>
            {renderLostItems(myLostItems, true)}
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-white/10 pb-4">My Found Items</h2>
            {renderFoundItems(myFoundItems, true)}
          </div>
        </div>
      )}
    </div>
  );
}
