'use client'

import Timer from "@/app/components/Timer";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6">
        <Timer />
        <Link 
          href="/" 
          className="text-sm text-slate-500 hover:text-slate-800 underline underline-offset-4 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}