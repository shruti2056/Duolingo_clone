"use client";

import { CheckCircle2, XCircle, Volume2 } from "lucide-react";
import { sound } from "@/lib/audio";

interface BottomFeedbackBarProps {
  status: "idle" | "correct" | "incorrect";
  correctAnswer?: any;
  explanation?: string;
  isCheckDisabled: boolean;
  onCheck: () => void;
  onContinue: () => void;
}

export default function BottomFeedbackBar({
  status,
  correctAnswer,
  explanation,
  isCheckDisabled,
  onCheck,
  onContinue,
}: BottomFeedbackBarProps) {
  const formatAnswer = (ans: any) => {
    if (Array.isArray(ans)) return ans.join(" ");
    if (typeof ans === "object" && ans !== null && ans.text) return ans.text;
    return String(ans || "");
  };

  return (
    <div
      className={`fixed bottom-0 left-0 w-full p-4 sm:p-6 transition-all duration-300 z-50 border-t-2 ${
        status === "correct"
          ? "bg-[#d7ffb8] dark:bg-[#1a3818] border-[#b8f28b] dark:border-[#275323]"
          : status === "incorrect"
          ? "bg-[#ffdadc] dark:bg-[#3a1a1c] border-[#ffb3b8] dark:border-[#572729]"
          : "bg-white dark:bg-[#131f24] border-[#e5e5e5] dark:border-[#37464f]"
      }`}
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Messaging & Explanations */}
        {status === "correct" && (
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-full bg-[#58cc02] flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-[#58cc02]">Nicely done!</h3>
              {explanation && <p className="text-xs font-semibold text-[#46a302] dark:text-[#8ce84a] mt-0.5">{explanation}</p>}
            </div>
          </div>
        )}

        {status === "incorrect" && (
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-full bg-[#ff4b4b] flex items-center justify-center text-white shrink-0">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-[#ff4b4b]">Correct solution:</h3>
              <p className="font-bold text-base text-[#ea2b2b] dark:text-[#ff8080] mt-0.5">{formatAnswer(correctAnswer)}</p>
              {explanation && <p className="text-xs font-semibold text-[#777777] dark:text-[#93a2a8] mt-1">{explanation}</p>}
            </div>
          </div>
        )}

        {status === "idle" && (
          <div className="hidden sm:block text-xs font-bold text-[#777777] dark:text-[#93a2a8]">
            Select an answer to continue
          </div>
        )}

        {/* Action Button */}
        {status === "idle" ? (
          <button
            onClick={onCheck}
            disabled={isCheckDisabled}
            className={`w-full sm:w-44 py-3.5 px-6 font-black text-sm tracking-wider uppercase rounded-2xl transition-all ${
              isCheckDisabled
                ? "btn-duo-gray cursor-not-allowed"
                : "btn-duo-green"
            }`}
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={onContinue}
            className={`w-full sm:w-44 py-3.5 px-6 font-black text-sm tracking-wider uppercase rounded-2xl transition-all ${
              status === "correct" ? "btn-duo-green" : "btn-duo-red"
            }`}
          >
            CONTINUE
          </button>
        )}
      </div>
    </div>
  );
}
