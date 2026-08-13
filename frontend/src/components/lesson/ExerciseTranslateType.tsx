"use client";

import { Volume2 } from "lucide-react";
import { Exercise } from "@/types";
import { sound } from "@/lib/audio";

interface ExerciseTranslateTypeProps {
  exercise: Exercise;
  value: string;
  onChange: (val: string) => void;
}

export default function ExerciseTranslateType({ exercise, value, onChange }: ExerciseTranslateTypeProps) {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
      <h2 className="text-2xl font-black text-[#4b4b4b] dark:text-[#f1f5f9] tracking-tight text-center">
        {exercise.prompt}
      </h2>

      {/* Duo Speech Bubble */}
      <div className="flex items-center gap-4 w-full">
        <div className="w-16 h-16 rounded-2xl bg-[#58cc02] flex items-center justify-center font-black text-2xl text-white shadow-md shrink-0">
          duo
        </div>

        <div className="relative flex items-center gap-3 p-4 bg-white dark:bg-[#18272c] border-2 border-[#e5e5e5] dark:border-[#37464f] rounded-2xl shadow-sm w-full">
          {exercise.audio_text && (
            <button
              onClick={() => sound.speak(exercise.audio_text!)}
              className="p-2.5 rounded-xl bg-[#1cb0f6] text-white hover:brightness-110 active:scale-95 transition-all shadow-sm shrink-0"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
          <span className="font-extrabold text-lg text-[#3c3c3c] dark:text-[#f1f5f9]">
            {exercise.question}
          </span>
        </div>
      </div>

      {/* Textarea Input */}
      <div className="w-full">
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type in Spanish..."
          className="w-full p-4 rounded-2xl border-2 border-[#e5e5e5] dark:border-[#37464f] bg-[#f7f7f7] dark:bg-[#18272c] focus:bg-white dark:focus:bg-[#202f36] focus:border-[#1cb0f6] text-lg font-bold text-[#3c3c3c] dark:text-[#f1f5f9] outline-none transition-all resize-none"
        />
      </div>
    </div>
  );
}
