"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import { ShoppingBag, Heart, Gem, Flame, Sparkles } from "lucide-react";
import { User } from "@/types";
import { fetchUser, refillHearts } from "@/lib/api";
import { sound } from "@/lib/audio";

export default function ShopPage() {
  const [user, setUser] = useState<User | null>(null);

  const loadUser = async () => {
    const data = await fetchUser();
    setUser(data);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleRefill = async () => {
    sound.playTap();
    if (!user || user.gems < 100) return;
    try {
      const res = await refillHearts("gems");
      if (res.success) {
        sound.playCorrect();
        loadUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#131f24] text-[#3c3c3c] dark:text-[#f1f5f9] flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col items-center pb-24">
        <TopNav user={user} />

        <main className="w-full max-w-xl px-4 py-8 flex flex-col items-center gap-8">
          {/* Shop Header */}
          <div className="w-full bg-[#1cb0f6] rounded-3xl p-6 text-white text-center shadow-lg flex flex-col items-center gap-2">
            <ShoppingBag className="w-14 h-14 fill-white text-white animate-bounce" />
            <h1 className="text-3xl font-black tracking-tight">Duo Shop</h1>
            <p className="text-sm font-extrabold opacity-90">
              Use your gems to refill hearts, protect your streak, or unlock power-ups!
            </p>
          </div>

          {/* Super Duolingo Banner */}
          <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                <span className="font-black text-xl">Super Duolingo</span>
              </div>
              <p className="text-xs font-semibold opacity-90 max-w-xs">
                Unlimited hearts, zero ads, and personalized practice review!
              </p>
            </div>
            <button
              onClick={() => alert("Super Duolingo subscription (mocked preview)!")}
              className="px-4 py-2.5 bg-white text-purple-700 font-extrabold text-xs rounded-xl shadow-md hover:scale-105 transition-all"
            >
              FREE TRIAL
            </button>
          </div>

          {/* Store Items List */}
          <div className="w-full flex flex-col gap-4">
            <h3 className="font-black text-xl text-[#3c3c3c] dark:text-[#f1f5f9]">Power-ups</h3>

            {/* Item 1: Refill Hearts */}
            <div className="p-5 bg-white dark:bg-[#18272c] border-2 border-[#e5e5e5] dark:border-[#37464f] rounded-3xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#ff4b4b] flex items-center justify-center text-white shrink-0 shadow-md">
                  <Heart className="w-8 h-8 fill-white" />
                </div>
                <div>
                  <h4 className="font-black text-base">Refill Hearts</h4>
                  <p className="text-xs font-semibold text-[#777777] dark:text-[#93a2a8]">
                    Get full hearts (5/5) so you don't worry about mistakes.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRefill}
                disabled={!user || user.gems < 100 || user.hearts >= user.max_hearts}
                className="btn-duo-blue px-4 py-2.5 flex items-center gap-1.5 text-xs font-black shrink-0"
              >
                <Gem className="w-4 h-4 fill-white" />
                100
              </button>
            </div>

            {/* Item 2: Streak Freeze */}
            <div className="p-5 bg-white dark:bg-[#18272c] border-2 border-[#e5e5e5] dark:border-[#37464f] rounded-3xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1cb0f6] flex items-center justify-center text-white shrink-0 shadow-md">
                  <Flame className="w-8 h-8 fill-white" />
                </div>
                <div>
                  <h4 className="font-black text-base">Streak Freeze</h4>
                  <p className="text-xs font-semibold text-[#777777] dark:text-[#93a2a8]">
                    Streak Freeze allows your streak to remain intact if you miss 1 day.
                  </p>
                </div>
              </div>

              <button
                onClick={() => alert("Streak freeze equipped!")}
                className="btn-duo-white px-4 py-2.5 flex items-center gap-1.5 text-xs font-black shrink-0"
              >
                <Gem className="w-4 h-4 text-[#1cb0f6]" />
                200
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
