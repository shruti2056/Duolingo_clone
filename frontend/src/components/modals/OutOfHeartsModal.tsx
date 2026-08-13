"use client";

import { Heart, Gem, RefreshCw, X } from "lucide-react";
import { sound } from "@/lib/audio";

interface OutOfHeartsModalProps {
  gems: number;
  onRefillWithGems: () => void;
  onPracticeRefill: () => void;
  onClose: () => void;
}

export default function OutOfHeartsModal({ gems, onRefillWithGems, onPracticeRefill, onClose }: OutOfHeartsModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131f24] border-4 border-[#ff4b4b] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-6 relative">
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-[#777777] hover:text-[#3c3c3c] dark:hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Broken Heart Mascot Banner */}
        <div className="w-20 h-20 rounded-full bg-[#ff4b4b] flex items-center justify-center text-white shadow-xl animate-pulse">
          <Heart className="w-10 h-10 fill-white" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-[#ff4b4b] tracking-tight">You ran out of hearts!</h2>
          <p className="text-sm font-bold text-[#777777] dark:text-[#93a2a8] mt-1">
            Refill your hearts to keep practicing Spanish lessons.
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 w-full">
          {/* Refill with Gems */}
          <button
            onClick={() => {
              sound.playTap();
              onRefillWithGems();
            }}
            disabled={gems < 100}
            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between font-extrabold text-sm transition-all ${
              gems >= 100
                ? "btn-duo-blue"
                : "btn-duo-gray cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 fill-white" />
              <span>REFILL HEARTS (5/5)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-xl">
              <Gem className="w-4 h-4 fill-white" />
              <span>100</span>
            </div>
          </button>

          {/* Practice to Earn Heart */}
          <button
            onClick={() => {
              sound.playTap();
              onPracticeRefill();
            }}
            className="w-full p-4 btn-duo-white flex items-center justify-between font-extrabold text-sm"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-[#1cb0f6]" />
              <span>PRACTICE TO EARN +1 HEART</span>
            </div>
            <span className="text-xs font-bold text-[#58cc02] uppercase">FREE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
