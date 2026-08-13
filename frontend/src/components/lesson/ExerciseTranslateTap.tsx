"use client";

import { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { Exercise } from "@/types";
import { sound } from "@/lib/audio";

interface ExerciseTranslateTapProps {
  exercise: Exercise;
  selectedWords: string[];
  onChange: (words: string[]) => void;
}

export default function ExerciseTranslateTap({ exercise, selectedWords, onChange }: ExerciseTranslateTapProps) {
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  useEffect(() => {
    if (exercise && Array.isArray(exercise.options)) {
      setAvailableWords([...exercise.options]);
    }
    // Auto speak audio on load if present
    if (exercise.audio_text) {
      sound.speak(exercise.audio_text);
    }
  }, [exercise]);

  const handleSelectWord = (word: string, index: number) => {
    sound.playTap();
    const newSelected = [...selectedWords, word];
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);

    setAvailableWords(newAvailable);
    onChange(newSelected);
  };

  const handleDeselectWord = (word: string, index: number) => {
    sound.playTap();
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    const newAvailable = [...availableWords, word];

    setAvailableWords(newAvailable);
    onChange(newSelected);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
      {/* Exercise Prompt */}
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

      {/* Word Answer Slots Container */}
      <div className="w-full min-h-[72px] border-b-2 border-t-2 border-[#e5e5e5] dark:border-[#37464f] p-3 flex flex-wrap gap-2 items-center bg-[#f7f7f7]/50 dark:bg-[#18272c]/50 rounded-xl">
        {selectedWords.map((word, idx) => (
          <button
            key={`selected-${word}-${idx}`}
            onClick={() => handleDeselectWord(word, idx)}
            className="px-4 py-2 bg-white dark:bg-[#202f36] border-2 border-[#e5e5e5] dark:border-[#37464f] border-b-4 border-b-[#cecece] dark:border-b-[#131f24] rounded-xl font-bold text-base text-[#3c3c3c] dark:text-[#f1f5f9] shadow-sm hover:scale-105 active:translate-y-1 transition-all"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Available Word Bank */}
      <div className="flex flex-wrap gap-2.5 justify-center max-w-lg mt-4">
        {availableWords.map((word, idx) => (
          <button
            key={`available-${word}-${idx}`}
            onClick={() => handleSelectWord(word, idx)}
            className="px-4 py-2.5 bg-white dark:bg-[#18272c] border-2 border-[#e5e5e5] dark:border-[#37464f] border-b-4 border-b-[#e5e5e5] dark:border-b-[#37464f] rounded-xl font-bold text-base text-[#3c3c3c] dark:text-[#f1f5f9] hover:bg-[#f7f7f7] dark:hover:bg-[#202f36] active:translate-y-1 active:border-b-0 transition-all shadow-sm"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
