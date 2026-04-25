"use client";

import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-center relative overflow-hidden">
      {/* Background ambient effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl space-y-8"
      >
        <h1 className="text-6xl md:text-8xl font-medium tracking-tighter text-neutral-900 dark:text-white leading-[1.1]">
          Lost something? <br/> Let AI find it.
        </h1>
        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
          Lost&Found matches lost items with found reports instantly using advanced AI models. We prioritize your privacy and ensure safe returns through verified, secure claims.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/report-lost"
            className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-neutral-200 transition-all hover:scale-[1.02] active:scale-95"
          >
            I lost an item
            <Search className="w-4 h-4" />
          </Link>
          <Link 
            href="/report-found"
            className="flex items-center gap-2 px-8 py-4 bg-transparent text-neutral-900 dark:text-white border border-neutral-300 dark:border-white/20 rounded-full font-medium hover:bg-white/5 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
          >
            I found an item
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-5xl mx-auto text-left w-full">
        {[
          {
            icon: Search,
            title: "Intelligent Matching",
            desc: "Our AI engine compares descriptions, locations, and timestamps to find the most probable matches for your lost item instantly."
          },
          {
            icon: ShieldCheck,
            title: "Verified Claims",
            desc: "To prevent false claims, we use dynamic verification questions. Only the true owner can unlock communication with the finder."
          },
          {
            icon: MapPin,
            title: "Privacy First",
            desc: "Finder identities and precise details of found items are kept completely hidden until ownership is securely verified."
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 p-8 rounded-3xl bg-white/40 dark:bg-neutral-900/40 border border-neutral-100 dark:border-white/5 hover:bg-white/80 dark:bg-neutral-900/80 hover:border-neutral-200 dark:border-white/10 transition-colors group"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-neutral-900 dark:text-white group-hover:bg-white group-hover:text-black transition-colors">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-neutral-900 dark:text-white">{feature.title}</h3>
            <p className="text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
