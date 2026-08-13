"use client";

import { Exercise } from "@/types";
import { sound } from "@/lib/audio";

interface ExerciseFillBlankProps {
  exercise: Exercise;
  selectedOption: string | null;
  onChange: (word: string) => void;
}

export default function ExerciseFillBlank({ exercise, selectedOption, onChange }: ExerciseFillBlankProps) {
  const options: string[] = Array.isArray(exercise.options) ? exercise.options : [];

  const handleSelect = (word: string) => {
    sound.playTap();
    onChange(word);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
      <h2 className="text-2xl font-black text-[#4b4b4b] dark:text-[#f1f5f9] tracking-tight text-center">
        {exercise.prompt}
      </h2>

      {/* Sentence with blank */}
      <div className="p-6 bg-white dark:bg-[#18272c] border-2 border-[#e5e5e5] dark:border-[#37464f] rounded-2xl shadow-sm text-xl font-extrabold text-[#3c3c3c] dark:text-[#f1f5f9] text-center w-full">
        {exercise.question.split("___").map((part, idx, arr) => (
          <span key={`part-${idx}`}>
            {part}
            {idx < arr.length - 1 && (
              <span className="inline-block mx-2 min-w-[80px] border-b-4 border-[#1cb0f6] text-[#1cb0f6] px-2 text-center">
                {selectedOption || "____"}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-3 justify-center w-full mt-4">
        {options.map((opt) => {
          const isSelected = selectedOption === opt;
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`px-6 py-3 rounded-2xl border-2 font-extrabold text-base transition-all ${
                isSelected
                  ? "bg-[#ddf4ff] dark:bg-[#183642] border-[#1cb0f6] border-b-4 text-[#1cb0f6] scale-105"
                  : "bg-white dark:bg-[#18272c] border-[#e5e5e5] dark:border-[#37464f] border-b-4 text-[#3c3c3c] dark:text-[#f1f5f9] hover:bg-[#f7f7f7]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
