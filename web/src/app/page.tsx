
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <nav className="absolute top-0 w-full p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg" />
          <span className="text-xl font-bold tracking-tight">LOGISTIK</span>
        </div>
        <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">
          Sign In
        </Link>
      </nav>

      <main className="text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-indigo-400 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          System Reconstructed & Verified
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">
          Enterprise Fleet & Order <br /> Management Platform
        </h1>

        <p className="text-zinc-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          The core infrastructure of Logistik has been successfully reconstructed with enterprise hardening,
          RLS multi-tenancy, and idempotent API versioning.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="group relative px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Console
            <span className="absolute -top-px -left-px -right-px -bottom-px rounded-xl border border-white/20 pointer-events-none group-hover:border-white/40 transition-colors" />
          </Link>

          <Link
            href="/dashboard"
            className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl font-semibold transition-all"
          >
            Internal Dashboard
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-12 text-zinc-600 text-sm">
        &copy; 2026 Logistik Enterprise. All rights reserved.
      </footer>
    </div>
  );
}
