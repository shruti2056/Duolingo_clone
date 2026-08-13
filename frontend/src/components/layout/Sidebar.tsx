"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Trophy, Target, ShoppingBag, User as UserIcon, RefreshCw, LogIn, LogOut } from "lucide-react";
import { sound } from "@/lib/audio";
import { resetDatabase, logout } from "@/lib/api";

const navItems = [
  { name: "LEARN", href: "/learn", icon: BookOpen },
  { name: "LEADERBOARD", href: "/leaderboard", icon: Trophy },
  { name: "QUESTS", href: "/quests", icon: Target },
  { name: "SHOP", href: "/shop", icon: ShoppingBag },
  { name: "PROFILE", href: "/profile", icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("duo_token");
  const handleLogout = async () => { await logout(); window.location.href = "/login"; };

  const handleReset = async () => {
    sound.playTap();
    if (confirm("Reset database to initial seeded state?")) {
      await resetDatabase();
      window.location.reload();
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r-2 border-[#e5e5e5] dark:border-[#37464f] bg-white dark:bg-[#131f24] p-4 flex flex-col justify-between z-40 hidden md:flex">
      <div>
        {/* Duolingo Brand Header */}
        <Link href="/learn" className="flex items-center gap-3 px-4 py-3 mb-6" onClick={() => sound.playTap()}>
          <div className="w-10 h-10 rounded-xl bg-[#58cc02] flex items-center justify-center font-black text-2xl text-white shadow-md">
            duo
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#58cc02]">duolingo</span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/learn");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => sound.playTap()}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm tracking-wider transition-all border-2 ${
                  isActive
                    ? "bg-[#ddf4ff] dark:bg-[#183642] text-[#1cb0f6] border-[#84d8ff] dark:border-[#0099e5]"
                    : "text-[#777777] dark:text-[#93a2a8] hover:bg-[#f7f7f7] dark:hover:bg-[#202f36] border-transparent"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "text-[#1cb0f6]" : "text-[#777777] dark:text-[#93a2a8]"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-[#e5e5e5] dark:border-[#37464f] mb-2">
        {isLoggedIn ? (
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[#ff4b4b] font-bold text-xs hover:bg-[#fff0f0] dark:hover:bg-[#3a1a1c]">
            <LogOut className="w-4 h-4" /> LOG OUT
          </button>
        ) : (
          <Link href="/login" className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[#1cb0f6] font-bold text-xs hover:bg-[#ddf4ff]">
            <LogIn className="w-4 h-4" /> SIGN IN
          </Link>
        )}
      </div>

      {/* Reset Seed Data Button */}
      <div className="pt-4 border-t border-[#e5e5e5] dark:border-[#37464f]">
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-[#e5e5e5] dark:border-[#37464f] text-[#777777] dark:text-[#93a2a8] font-bold text-xs hover:bg-[#f7f7f7] dark:hover:bg-[#202f36] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          RESET DATA SEED
        </button>
      </div>
    </aside>
  );
}
