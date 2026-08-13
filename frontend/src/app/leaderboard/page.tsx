"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import { Trophy, Crown, Flame, Zap } from "lucide-react";
import { LeaderboardUser, User } from "@/types";
import { fetchLeaderboard, fetchUser } from "@/lib/api";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    Promise.all([fetchLeaderboard(), fetchUser()]).then(([lbData, uData]) => {
      setLeaderboard(lbData);
      setUser(uData);
    });
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#131f24] text-[#3c3c3c] dark:text-[#f1f5f9] flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col items-center pb-24">
        <TopNav user={user} />

        <main className="w-full max-w-xl px-4 py-8 flex flex-col items-center">
          {/* League Banner Header */}
          <div className="w-full bg-[#ffc800] rounded-3xl p-6 text-white text-center shadow-lg mb-8 flex flex-col items-center gap-2">
            <Trophy className="w-16 h-16 fill-white text-white animate-bounce" />
            <h1 className="text-3xl font-black tracking-tight">Bronze League</h1>
            <p className="text-sm font-extrabold opacity-90">
              Top 3 learners advance to Silver League at the end of the week!
            </p>
          </div>

          {/* Top 3 Podium Standings */}
          {topThree.length >= 3 && (
            <div className="flex items-end justify-center gap-4 w-full mb-8 px-2">
              {/* 2nd Place */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-16 h-16 rounded-full border-4 border-[#cecece] bg-white overflow-hidden shadow-md mb-2 relative">
                  <img src={topThree[1].avatar_url} alt={topThree[1].name} className="w-full h-full object-cover" />
                  <div className="absolute -top-2 -right-1 bg-[#cecece] text-white p-1 rounded-full text-xs font-black">
                    2
                  </div>
                </div>
                <span className="font-extrabold text-xs text-center line-clamp-1">{topThree[1].name}</span>
                <span className="text-xs font-black text-[#ffc800]">{topThree[1].weekly_xp} XP</span>
                <div className="w-full h-20 bg-[#f7f7f7] dark:bg-[#18272c] border-2 border-[#cecece] rounded-t-2xl mt-2 flex items-center justify-center font-black text-xl text-[#cecece]">
                  2
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center flex-1 -mt-4">
                <Crown className="w-8 h-8 text-[#ffc800] fill-[#ffc800] mb-1 animate-pulse" />
                <div className="w-20 h-20 rounded-full border-4 border-[#ffc800] bg-white overflow-hidden shadow-xl mb-2 relative">
                  <img src={topThree[0].avatar_url} alt={topThree[0].name} className="w-full h-full object-cover" />
                  <div className="absolute -top-2 -right-1 bg-[#ffc800] text-white p-1 rounded-full text-xs font-black">
                    1
                  </div>
                </div>
                <span className="font-extrabold text-sm text-center line-clamp-1">{topThree[0].name}</span>
                <span className="text-sm font-black text-[#ffc800]">{topThree[0].weekly_xp} XP</span>
                <div className="w-full h-28 bg-[#ffc800]/20 border-2 border-[#ffc800] rounded-t-2xl mt-2 flex items-center justify-center font-black text-3xl text-[#ffc800]">
                  1
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-16 h-16 rounded-full border-4 border-[#cd7f32] bg-white overflow-hidden shadow-md mb-2 relative">
                  <img src={topThree[2].avatar_url} alt={topThree[2].name} className="w-full h-full object-cover" />
                  <div className="absolute -top-2 -right-1 bg-[#cd7f32] text-white p-1 rounded-full text-xs font-black">
                    3
                  </div>
                </div>
                <span className="font-extrabold text-xs text-center line-clamp-1">{topThree[2].name}</span>
                <span className="text-xs font-black text-[#ffc800]">{topThree[2].weekly_xp} XP</span>
                <div className="w-full h-16 bg-[#f7f7f7] dark:bg-[#18272c] border-2 border-[#cd7f32] rounded-t-2xl mt-2 flex items-center justify-center font-black text-xl text-[#cd7f32]">
                  3
                </div>
              </div>
            </div>
          )}

          {/* Full League Standings Table */}
          <div className="w-full flex flex-col gap-2">
            {leaderboard.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                  item.is_current_user
                    ? "bg-[#ddf4ff] dark:bg-[#183642] border-[#1cb0f6] shadow-md scale-102"
                    : "bg-white dark:bg-[#18272c] border-[#e5e5e5] dark:border-[#37464f]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-black text-base w-6 text-center text-[#777777] dark:text-[#93a2a8]">
                    {idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-[#e5e5e5]">
                    <img src={item.avatar_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#3c3c3c] dark:text-[#f1f5f9]">{item.name}</h4>
                    {item.is_current_user && (
                      <span className="text-xs font-bold text-[#1cb0f6] uppercase tracking-wider">YOU</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 font-black text-sm text-[#ffc800]">
                  <Zap className="w-4 h-4 fill-[#ffc800]" />
                  <span>{item.weekly_xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
