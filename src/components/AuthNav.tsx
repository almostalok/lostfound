"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-neutral-400">Hi, {user.user_metadata?.name?.split(' ')[0] || "User"}</span>
        <button onClick={handleLogout} className="text-sm font-medium bg-white/10 text-white px-5 py-2.5 rounded-full hover:bg-white/20 transition-colors border border-white/10">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/auth/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
        Login
      </Link>
      <Link href="/auth/register" className="text-sm font-medium bg-white text-black px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-colors">
        Sign Up
      </Link>
    </div>
  );
}
