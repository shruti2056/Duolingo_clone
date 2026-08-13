"use client";

import { useState, useEffect } from "react";
import { Exercise, MatchPairOption } from "@/types";
import { sound } from "@/lib/audio";

interface ExerciseMatchPairsProps {
  exercise: Exercise;
  onChange: (matchedPairs: MatchPairOption[]) => void;
}

export default function ExerciseMatchPairs({ exercise, onChange }: ExerciseMatchPairsProps) {
  const [pairs, setPairs] = useState<MatchPairOption[]>([]);
  const [spanishWords, setSpanishWords] = useState<string[]>([]);
  const [englishWords, setEnglishWords] = useState<string[]>([]);

  const [selectedSpanish, setSelectedSpanish] = useState<string | null>(null);
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [matchedSpanish, setMatchedSpanish] = useState<string[]>([]);

  useEffect(() => {
    if (exercise && Array.isArray(exercise.options)) {
      const rawPairs: MatchPairOption[] = exercise.options;
      setPairs(rawPairs);

      // Shuffle spanish and english words independently
      const sp = rawPairs.map((p) => p.spanish).sort(() => Math.random() - 0.5);
      const en = rawPairs.map((p) => p.english).sort(() => Math.random() - 0.5);

      setSpanishWords(sp);
      setEnglishWords(en);
    }
  }, [exercise]);

  const handleSelectSpanish = (word: string) => {
    if (matchedSpanish.includes(word)) return;
    sound.playTap();
    setSelectedSpanish(word);
    checkPair(word, selectedEnglish);
  };

  const handleSelectEnglish = (word: string) => {
    // Check if english word corresponds to already matched
    const isMatched = pairs.some((p) => p.english === word && matchedSpanish.includes(p.spanish));
    if (isMatched) return;
    sound.playTap();
    setSelectedEnglish(word);
    checkPair(selectedSpanish, word);
  };

  const checkPair = (spWord: string | null, enWord: string | null) => {
    if (!spWord || !enWord) return;

    const isMatch = pairs.some((p) => p.spanish === spWord && p.english === enWord);
    if (isMatch) {
      sound.playCorrect();
      const updatedMatched = [...matchedSpanish, spWord];
      setMatchedSpanish(updatedMatched);
      setSelectedSpanish(null);
      setSelectedEnglish(null);

      if (updatedMatched.length === pairs.length) {
        onChange(pairs);
      }
    } else {
      sound.playIncorrect();
      setTimeout(() => {
        setSelectedSpanish(null);
        setSelectedEnglish(null);
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
      <h2 className="text-2xl font-black text-[#4b4b4b] dark:text-[#f1f5f9] tracking-tight text-center">
        {exercise.prompt}
      </h2>

      <div className="grid grid-cols-2 gap-4 w-full mt-4">
        {/* Spanish Column */}
        <div className="flex flex-col gap-3">
          {spanishWords.map((word) => {
            const isMatched = matchedSpanish.includes(word);
            const isSelected = selectedSpanish === word;
            return (
              <button
                key={`sp-${word}`}
                onClick={() => handleSelectSpanish(word)}
                disabled={isMatched}
                className={`py-3.5 px-4 rounded-2xl border-2 font-bold text-base transition-all ${
                  isMatched
                    ? "bg-[#e5e5e5] dark:bg-[#37464f] border-transparent opacity-40 cursor-not-allowed"
                    : isSelected
                    ? "bg-[#ddf4ff] dark:bg-[#183642] border-[#1cb0f6] border-b-4 text-[#1cb0f6]"
                    : "bg-white dark:bg-[#18272c] border-[#e5e5e5] dark:border-[#37464f] border-b-4 text-[#3c3c3c] dark:text-[#f1f5f9] hover:bg-[#f7f7f7]"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>

        {/* English Column */}
        <div className="flex flex-col gap-3">
          {englishWords.map((word) => {
            const isMatched = pairs.some((p) => p.english === word && matchedSpanish.includes(p.spanish));
            const isSelected = selectedEnglish === word;
            return (
              <button
                key={`en-${word}`}
                onClick={() => handleSelectEnglish(word)}
                disabled={isMatched}
                className={`py-3.5 px-4 rounded-2xl border-2 font-bold text-base transition-all ${
                  isMatched
                    ? "bg-[#e5e5e5] dark:bg-[#37464f] border-transparent opacity-40 cursor-not-allowed"
                    : isSelected
                    ? "bg-[#ddf4ff] dark:bg-[#183642] border-[#1cb0f6] border-b-4 text-[#1cb0f6]"
                    : "bg-white dark:bg-[#18272c] border-[#e5e5e5] dark:border-[#37464f] border-b-4 text-[#3c3c3c] dark:text-[#f1f5f9] hover:bg-[#f7f7f7]"
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
