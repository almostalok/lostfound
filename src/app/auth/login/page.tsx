"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-3xl bg-neutral-900/50 border border-white/10 backdrop-blur-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Welcome Back</h1>
          <p className="text-neutral-400 text-sm">Login to your Nexus.Find account.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input required name="email" type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors" placeholder="hello@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input required name="password" type="password" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors" placeholder="••••••••" />
          </div>
          
          <button disabled={isLoading} type="submit" className="w-full mt-6 bg-white text-black py-3.5 rounded-xl font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-white hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
