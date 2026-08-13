"use client";

import { Exercise, ExerciseOptionMultipleChoice } from "@/types";
import { sound } from "@/lib/audio";

interface ExerciseMultipleChoiceProps {
  exercise: Exercise;
  selectedOption: string | null;
  onChange: (optionText: string) => void;
}

export default function ExerciseMultipleChoice({ exercise, selectedOption, onChange }: ExerciseMultipleChoiceProps) {
  const options: ExerciseOptionMultipleChoice[] = Array.isArray(exercise.options) ? exercise.options : [];

  const handleSelect = (text: string) => {
    sound.playTap();
    onChange(text);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
      <h2 className="text-2xl font-black text-[#4b4b4b] dark:text-[#f1f5f9] tracking-tight text-center">
        {exercise.prompt}
      </h2>

      {/* Question Prompt */}
      <div className="text-xl font-bold text-[#1cb0f6] bg-[#ddf4ff] dark:bg-[#183642] px-6 py-3 rounded-2xl border-2 border-[#84d8ff]">
        "{exercise.question}"
      </div>

      {/* Options Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
        {options.map((opt, idx) => {
          const isSelected = selectedOption === opt.text;
          return (
            <button
              key={opt.text}
              onClick={() => handleSelect(opt.text)}
              className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all ${
                isSelected
                  ? "bg-[#ddf4ff] dark:bg-[#183642] border-[#1cb0f6] border-b-4 shadow-md scale-105"
                  : "bg-white dark:bg-[#18272c] border-[#e5e5e5] dark:border-[#37464f] border-b-4 border-b-[#e5e5e5] hover:bg-[#f7f7f7] dark:hover:bg-[#202f36]"
              }`}
            >
              <div className="w-8 h-8 rounded-xl border-2 border-[#e5e5e5] dark:border-[#37464f] flex items-center justify-center font-black text-xs text-[#777777] dark:text-[#93a2a8] mb-3">
                {idx + 1}
              </div>

              <span className="font-extrabold text-lg text-[#3c3c3c] dark:text-[#f1f5f9] mb-1">
                {opt.text}
              </span>

              {opt.subtext && (
                <span className="text-xs font-semibold text-[#777777] dark:text-[#93a2a8]">
                  {opt.subtext}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
