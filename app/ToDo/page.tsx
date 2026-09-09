import Link from 'next/link';
import ToDo from '../components/ToDo';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-6">
        <ToDo />
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