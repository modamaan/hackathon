"use client";

import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { Leaf, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function Navbar() {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-950" />
          </div>
          <span className="font-bold text-lg text-white">FarmBot</span>
          <span className="hidden sm:inline text-xs font-semibold bg-green-400/20 text-green-300 border border-green-400/30 px-2 py-0.5 rounded-full">
            AI
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/history"
                className="text-sm font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                History
              </Link>
              <button
                onClick={logout}
                className="text-sm flex items-center gap-1.5 font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="text-sm flex items-center gap-1.5 font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              Sign in
            </button>
          )}

          <Link
            href="/diagnose"
            className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-lg px-4 py-1.5 bg-green-400 text-green-950 hover:bg-green-300 transition-colors"
          >
            🔍 Diagnose
          </Link>
        </div>
      </div>
    </nav>
  );
}
