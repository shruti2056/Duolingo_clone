"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Zap, Target, Flame, ArrowRight } from "lucide-react";
import { sound } from "@/lib/audio";

interface LessonCompleteModalProps {
  xpEarned: number;
  accuracy: number;
  streak: number;
  onClose: () => void;
}

export default function LessonCompleteModal({ xpEarned, accuracy, streak, onClose }: LessonCompleteModalProps) {
  useEffect(() => {
    // Play celebratory sound fanfare
    sound.playFanfare();

    // Trigger canvas confetti explosion
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback if canvas confetti unavailable
    }
  }, []);

  const accuracyPercent = Math.round(accuracy * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131f24] border-4 border-[#58cc02] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-6">
        {/* Duo Mascot Banner */}
        <div className="w-24 h-24 rounded-full bg-[#58cc02] flex items-center justify-center font-black text-4xl text-white shadow-xl animate-bounce">
          duo
        </div>

        <div>
          <h2 className="text-3xl font-black text-[#58cc02] tracking-tight">Lesson Complete!</h2>
          <p className="text-sm font-bold text-[#777777] dark:text-[#93a2a8] mt-1">
            You're making great progress in Spanish!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* Total XP Card */}
          <div className="bg-[#ffc800]/10 border-2 border-[#ffc800] p-4 rounded-2xl flex flex-col items-center">
            <Zap className="w-6 h-6 text-[#ffc800] fill-[#ffc800] mb-1" />
            <span className="text-xs font-bold text-[#777777] dark:text-[#93a2a8] uppercase">TOTAL XP</span>
            <span className="text-xl font-black text-[#ffc800]">+{xpEarned}</span>
          </div>

          {/* Accuracy Card */}
          <div className="bg-[#58cc02]/10 border-2 border-[#58cc02] p-4 rounded-2xl flex flex-col items-center">
            <Target className="w-6 h-6 text-[#58cc02] mb-1" />
            <span className="text-xs font-bold text-[#777777] dark:text-[#93a2a8] uppercase">ACCURACY</span>
            <span className="text-xl font-black text-[#58cc02]">{accuracyPercent}%</span>
          </div>

          {/* Streak Card */}
          <div className="bg-[#ff9600]/10 border-2 border-[#ff9600] p-4 rounded-2xl flex flex-col items-center">
            <Flame className="w-6 h-6 text-[#ff9600] fill-[#ff9600] mb-1" />
            <span className="text-xs font-bold text-[#777777] dark:text-[#93a2a8] uppercase">STREAK</span>
            <span className="text-xl font-black text-[#ff9600]">{streak} Days</span>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="w-full py-4 btn-duo-green flex items-center justify-center gap-2 text-base uppercase tracking-wider shadow-lg"
        >
          CONTINUE
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
