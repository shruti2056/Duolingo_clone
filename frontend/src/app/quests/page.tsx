"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import { Target, Flame, Zap, BookOpen, Award, CheckCircle2 } from "lucide-react";
import { Achievement, User } from "@/types";
import { fetchAchievements, fetchUser } from "@/lib/api";

export default function QuestsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    Promise.all([fetchAchievements(), fetchUser()]).then(([aData, uData]) => {
      setAchievements(aData);
      setUser(uData);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#131f24] text-[#3c3c3c] dark:text-[#f1f5f9] flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col items-center pb-24">
        <TopNav user={user} />

        <main className="w-full max-w-xl px-4 py-8 flex flex-col items-center gap-8">
          {/* Daily Quests Header */}
          <div className="w-full bg-[#ce82ff] rounded-3xl p-6 text-white text-center shadow-lg flex flex-col items-center gap-2">
            <Target className="w-14 h-14 fill-white text-white animate-pulse" />
            <h1 className="text-3xl font-black tracking-tight">Daily Quests</h1>
            <p className="text-sm font-extrabold opacity-90">
              Complete quests every day to earn gems and boost your streak!
            </p>
          </div>

          {/* Daily Goal Progress Bar Card */}
          <div className="w-full bg-white dark:bg-[#18272c] border-2 border-[#e5e5e5] dark:border-[#37464f] p-5 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-base text-[#3c3c3c] dark:text-[#f1f5f9]">Daily XP Goal</span>
              <span className="font-black text-sm text-[#ffc800]">{user?.xp || 0} / 50 XP</span>
            </div>
            <div className="w-full h-4 bg-[#e5e5e5] dark:bg-[#37464f] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffc800] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((user?.xp || 0) / 50) * 100)}%` }}
              />
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="w-full flex flex-col gap-4">
            <h3 className="font-black text-xl text-[#3c3c3c] dark:text-[#f1f5f9]">Achievements</h3>

            {achievements.map((ach) => {
              const percent = Math.min(100, (ach.current_progress / ach.max_progress) * 100);
              return (
                <div
                  key={ach.id}
                  className={`p-5 rounded-3xl border-2 flex items-center gap-4 transition-all ${
                    ach.is_unlocked
                      ? "bg-[#ffc800]/10 border-[#ffc800]"
                      : "bg-white dark:bg-[#18272c] border-[#e5e5e5] dark:border-[#37464f]"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                      ach.is_unlocked ? "bg-[#ffc800]" : "bg-[#cecece] dark:bg-[#37464f]"
                    }`}
                  >
                    <Award className="w-8 h-8" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-black text-base text-[#3c3c3c] dark:text-[#f1f5f9]">{ach.title}</h4>
                      {ach.is_unlocked && <CheckCircle2 className="w-5 h-5 text-[#58cc02]" />}
                    </div>
                    <p className="text-xs font-semibold text-[#777777] dark:text-[#93a2a8] mb-2">
                      {ach.description}
                    </p>

                    <div className="w-full h-3 bg-[#e5e5e5] dark:bg-[#37464f] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#58cc02] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
