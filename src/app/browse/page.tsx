"use client";

import { useEffect, useState, Suspense } from "react";
import { Search, MapPin, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { getMyLostItems, getMatchesForLostItem } from "../actions";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";

function BrowseContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [myLostItems, setMyLostItems] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) setLoading(false);
    });
  }, [supabase.auth]);

  useEffect(() => {
    if (user) {
      getMyLostItems(user.id).then(items => {
        setMyLostItems(items);
        setLoading(false);
      });
    }
  }, [user]);

  const selectedItem = selectedId 
    ? myLostItems.find(item => item.id === selectedId) 
    : myLostItems[0];
    
  const activeId = selectedItem?.id;

  useEffect(() => {
    if (activeId) {
      getMatchesForLostItem(activeId).then(m => setMatches(m));
    } else {
      setMatches([]);
    }
  }, [activeId]);

  if (loading) {
    return <div className="max-w-2xl mx-auto py-24 text-center text-neutral-600 dark:text-neutral-400">Loading your reports...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white mb-4">Login Required</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">You must be logged in to browse your matches.</p>
        <Link href="/auth/login" className="px-6 py-3 bg-white text-black rounded-lg font-medium inline-block hover:bg-neutral-200 transition-colors">
          Log In or Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-8rem)]">
      {/* Sidebar - Lost Items */}
      <div className="w-full md:w-1/3 flex flex-col bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm h-full">
        <div className="p-4 border-b border-neutral-200 dark:border-white/10 bg-white/40 dark:bg-black/40">
          <h2 className="font-medium text-neutral-900 dark:text-white">Your Reports</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {myLostItems.length === 0 ? (
            <div className="p-4 text-sm text-neutral-500 dark:text-neutral-500">You haven't reported any lost items yet.</div>
          ) : myLostItems.map((item) => {
            const isActive = item.id === activeId;
            return (
              <Link 
                href={`/browse?id=${item.id}`} 
                key={item.id} 
                className={`block p-4 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-white/10 border border-neutral-300 dark:border-white/20' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-neutral-900 dark:text-white">{item.name}</h3>
                  {item.status === 'matched' && <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-semibold uppercase tracking-wider rounded-md">Match Found</span>}
                  {item.status === 'searching' && <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-semibold uppercase tracking-wider rounded-md">Searching</span>}
                  {item.status === 'resolved' && <span className="px-2 py-1 bg-neutral-500/20 text-neutral-600 dark:text-neutral-400 text-[10px] font-semibold uppercase tracking-wider rounded-md">Resolved</span>}
                </div>
                <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-500 gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{item.location_lost}</span>
                </div>
                <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-500 gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.date_lost).toLocaleDateString()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content - Potential Matches */}
      <div className="w-full md:w-2/3 flex flex-col bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm h-full">
        {selectedItem ? (
          <>
            <div className="p-6 border-b border-neutral-200 dark:border-white/10">
              <h2 className="text-xl font-medium text-neutral-900 dark:text-white mb-1">Potential Matches</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {matches.length === 0 
                  ? `No matches found yet for ${selectedItem.name}.` 
                  : `AI found ${matches.length} potential match${matches.length > 1 ? 'es' : ''} for your ${selectedItem.name}.`}
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {matches.map(match => (
                <div key={match.id} className="bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      {Math.round(match.match_score * 100)}% Match Score
                    </div>
                    <span className="text-sm text-neutral-500 dark:text-neutral-500">Found: {new Date(match.foundItem.date_found).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 mb-6">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider font-medium mb-1">Category</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{match.foundItem.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider font-medium mb-1">Location Found</p>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{match.foundItem.location_found}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider font-medium mb-1">Finder's Description</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {match.foundItem.description}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-neutral-100 dark:border-white/5 rounded-lg p-4 mb-6 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">Verification Required</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">To contact the finder, you must answer a few specific questions to prove ownership. The finder's identity is protected.</p>
                    </div>
                  </div>

                  {match.status === 'pending' && (
                    <Link href={`/verify/${match.id}`} className="block text-center w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors">
                      Claim & Verify Ownership
                    </Link>
                  )}
                  {match.status === 'verified' && (
                    <Link href={`/chat/${match.id}`} className="block w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-neutral-900 dark:text-white text-center rounded-lg font-medium transition-colors">
                      Ownership Verified. Contact the finder.
                    </Link>
                  )}
                  {match.status === 'rejected' && (
                    <div className="w-full py-3 bg-red-500/20 text-red-400 text-center rounded-lg font-medium">
                      Verification Failed. This claim was rejected.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-500 p-6 text-center">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a reported item from the sidebar to view matches.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto py-24 text-center text-neutral-600 dark:text-neutral-400">Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
