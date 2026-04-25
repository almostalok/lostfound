"use client";

import { ArrowRight, Lock } from "lucide-react";
import { submitFoundItem } from "../actions";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function ReportFound() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, [supabase.auth]);

  if (loading) {
    return <div className="max-w-2xl mx-auto py-24 text-center text-neutral-600 dark:text-neutral-400">Checking authentication...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white mb-4">Login Required</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">You must be logged in to report a found item.</p>
        <Link href="/auth/login" className="px-6 py-3 bg-white text-black rounded-lg font-medium inline-block hover:bg-neutral-200 transition-colors">
          Log In or Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-10 text-center">
        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-700 mx-auto mb-4">
          <ArrowRight className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">Report a Found Item</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          Your identity and contact info remain strictly hidden.
        </p>
      </div>

      <form action={submitFoundItem} className="space-y-6 bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="userEmail" value={user.email} />
        <input type="hidden" name="userName" value={user.user_metadata?.name || 'User'} />

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Category</label>
              <select id="category" name="category" required className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/50 text-neutral-900 dark:text-white focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition-all appearance-none">
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="wallets">Wallets & Bags</option>
                <option value="keys">Keys</option>
                <option value="clothing">Clothing & Accessories</option>
                <option value="documents">Documents</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Date Found</label>
              <input type="date" id="date" name="date" required className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/50 text-neutral-900 dark:text-white focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition-all" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">General Location Found</label>
            <input type="text" id="location" name="location" required placeholder="e.g. 5th Ave Subway Station, Platform 2" className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/50 text-neutral-900 dark:text-white focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition-all" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Basic Description (Externally Visible)</label>
            <textarea id="description" name="description" required rows={4} placeholder="Describe only what is visible from the outside. Do NOT list specific contents or hidden details..." className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/50 text-neutral-900 dark:text-white focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition-all resize-none"></textarea>
            <div className="bg-white/40 dark:bg-black/40 p-3 mt-2 rounded-lg border border-neutral-100 dark:border-white/5">
              <p className="text-xs text-neutral-900 dark:text-white font-medium">Important Privacy Rule:</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">To prevent scammers, omit hidden identifiers (like serial numbers or specific pocket contents). The AI uses these omissions to test claimants later.</p>
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Upload Image (Optional but Recommended)</label>
            <input type="file" id="image" name="image" accept="image/*" className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/50 text-neutral-900 dark:text-white focus:border-white/30 focus:ring-1 focus:ring-white/30 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-neutral-200" />
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">Take a clear photo of the item. This is critical for accurate AI matching.</p>
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-white text-black rounded-xl font-medium hover:bg-neutral-200 transition-colors">
          Submit Found Item
        </button>
      </form>
    </div>
  );
}
