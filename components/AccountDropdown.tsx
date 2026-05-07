"use client";

import { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { LogOut, Monitor, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { logout } from "@/app/auth/actions";

export default function AccountDropdown({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const email = user?.email || "user@example.com";
  const fullName = user?.user_metadata?.full_name || email.split("@")[0];
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = (fullName || email).charAt(0).toUpperCase();

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-[14px] text-stone-700 dark:text-stone-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl transition-all cursor-pointer font-medium ${isOpen ? "bg-black/[0.04] dark:bg-white/[0.06]" : ""}`}
      >
        <div className="w-6 h-6 rounded-lg bg-stone-200 dark:bg-stone-800 overflow-hidden flex items-center justify-center text-[11px] font-bold text-stone-600 dark:text-stone-300 shadow-sm shrink-0 border border-black/[0.04] dark:border-white/[0.06]">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <span className="truncate">{fullName}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-xl p-1.5 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
          <div className="px-2 py-2 mb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">Account</p>
            <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-100 truncate">{fullName}</p>
            <p className="text-[11px] text-stone-500 truncate">{email}</p>
          </div>

          <div className="py-1">
            <p className="px-2 py-1 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Appearance</p>
            <button
              onClick={() => setTheme("light")}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] font-medium text-stone-700 dark:text-stone-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-md transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </div>
              {mounted && theme === "light" && <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] font-medium text-stone-700 dark:text-stone-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-md transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </div>
              {mounted && theme === "dark" && <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setTheme("system")}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[13px] font-medium text-stone-700 dark:text-stone-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-md transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
              </div>
              {mounted && theme === "system" && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="h-px bg-black/[0.04] dark:bg-white/[0.06] my-1" />

          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-2 py-1.5 text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
