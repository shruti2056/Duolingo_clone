"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import { User, Achievement } from "@/types";
import { fetchUser, fetchAchievements } from "@/lib/api";
import { Flame, Zap, Gem, Crown, Award, Calendar } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    Promise.all([fetchUser(), fetchAchievements()]).then(([uData, aData]) => {
      setUser(uData);
      setAchievements(aData);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#131f24] text-[#3c3c3c] dark:text-[#f1f5f9] flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col items-center pb-24">
        <TopNav user={user} />

        <main className="w-full max-w-xl px-4 py-8 flex flex-col items-center gap-8">
          {/* User Header Profile */}
          <div className="w-full bg-white dark:bg-[#18272c] border-2 border-[#e5e5e5] dark:border-[#37464f] rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-[#58cc02] overflow-hidden border-4 border-[#58cc02] shadow-md shrink-0">
              <img src={user?.avatar_url} alt={user?.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-black text-[#3c3c3c] dark:text-[#f1f5f9]">{user?.name}</h1>
              <p className="text-sm font-bold text-[#777777] dark:text-[#93a2a8]">@{user?.username}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-xs font-semibold text-[#777777] dark:text-[#93a2a8]">
                <Calendar className="w-4 h-4 text-[#1cb0f6]" />
                <span>Joined August 2026</span>
              </div>
            </div>
          </div>

          {/* Core Stats Overview */}
          <div className="w-full">
            <h3 className="font-black text-xl text-[#3c3c3c] dark:text-[#f1f5f9] mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Day Streak */}
              <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] bg-white dark:bg-[#18272c] flex items-center gap-4">
                <Flame className="w-8 h-8 text-[#ff9600] fill-[#ff9600]" />
                <div>
                  <span className="text-xl font-black text-[#3c3c3c] dark:text-[#f1f5f9]">{user?.streak || 0}</span>
                  <p className="text-xs font-bold text-[#777777] dark:text-[#93a2a8]">Day streak</p>
                </div>
              </div>

              {/* Total XP */}
              <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] bg-white dark:bg-[#18272c] flex items-center gap-4">
                <Zap className="w-8 h-8 text-[#ffc800] fill-[#ffc800]" />
                <div>
                  <span className="text-xl font-black text-[#3c3c3c] dark:text-[#f1f5f9]">{user?.xp || 0}</span>
                  <p className="text-xs font-bold text-[#777777] dark:text-[#93a2a8]">Total XP</p>
                </div>
              </div>

              {/* Gems */}
              <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] bg-white dark:bg-[#18272c] flex items-center gap-4">
                <Gem className="w-8 h-8 text-[#1cb0f6] fill-[#1cb0f6]" />
                <div>
                  <span className="text-xl font-black text-[#3c3c3c] dark:text-[#f1f5f9]">{user?.gems || 0}</span>
                  <p className="text-xs font-bold text-[#777777] dark:text-[#93a2a8]">Gems</p>
                </div>
              </div>

              {/* Crowns */}
              <div className="p-4 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] bg-white dark:bg-[#18272c] flex items-center gap-4">
                <Crown className="w-8 h-8 text-[#ffc800] fill-[#ffc800]" />
                <div>
                  <span className="text-xl font-black text-[#3c3c3c] dark:text-[#f1f5f9]">1</span>
                  <p className="text-xs font-bold text-[#777777] dark:text-[#93a2a8]">Crowns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Showcase */}
          <div className="w-full">
            <h3 className="font-black text-xl text-[#3c3c3c] dark:text-[#f1f5f9] mb-4">Achievements</h3>
            <div className="flex flex-col gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-4 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] bg-white dark:bg-[#18272c] flex items-center gap-4"
                >
                  <Award className={`w-8 h-8 ${ach.is_unlocked ? "text-[#ffc800]" : "text-[#777777]"}`} />
                  <div>
                    <h4 className="font-black text-sm">{ach.title}</h4>
                    <p className="text-xs font-semibold text-[#777777] dark:text-[#93a2a8]">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
