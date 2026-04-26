"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone_number = formData.get("phone_number") as string;
    const aadhar_card = formData.get("aadhar_card") as string;

    const emailRedirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          name,
          phone_number,
          aadhar_card,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      return;
    }

    setPendingVerificationEmail(email);
  }

  if (pendingVerificationEmail) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md p-8 rounded-3xl bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 backdrop-blur-md text-center">
          <h1 className="text-3xl font-medium tracking-tight mb-3">Verify your email</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
            We sent a verification link to <span className="font-medium text-neutral-900 dark:text-white">{pendingVerificationEmail}</span>.
            Open your inbox and click the link to continue.
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-8">
            After verification, you will be signed in automatically and redirected to your dashboard.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setPendingVerificationEmail(null)}
              className="w-full bg-white text-black py-3.5 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
            >
              Use a different email
            </button>
            <Link href="/auth/login" className="text-sm text-neutral-700 dark:text-neutral-300 hover:underline underline-offset-4">
              Already verified? Continue to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 backdrop-blur-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Create Account</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">Join Nexus.Find to report or claim items.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">Full Name</label>
            <input required name="name" type="text" className="w-full bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input required name="email" type="email" className="w-full bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors" placeholder="hello@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
            <input required name="phone_number" type="tel" className="w-full bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors" placeholder="+91 9876543210" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">Aadhar Card Number</label>
            <input required name="aadhar_card" type="text" pattern="[0-9]{12}" title="12 digit Aadhar number" className="w-full bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors" placeholder="XXXX XXXX XXXX" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input required name="password" type="password" className="w-full bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors" placeholder="••••••••" />
          </div>
          
          <button disabled={isLoading} type="submit" className="w-full mt-6 bg-white text-black py-3.5 rounded-xl font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-neutral-900 dark:text-white hover:underline underline-offset-4">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
