"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { LanguageModal.tsx } from "@/types";
import { fetchLanguages, switchLanguage } from "@/lib/api";
import { sound } from "@/lib/audio";

interface LanguageModalProps {
  isOpen: boolean;
  currentLanguageId?: number;
  onClose: () => void;
  onSelectLanguage: (lang: Language) => void;
}

export default function LanguageModal({ isOpen, currentLanguageId, onClose, onSelectLanguage }: LanguageModalProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLanguages()
        .then(setLanguages)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = async (lang: Language) => {
    sound.playTap();
    try {
      await switchLanguage(lang.id);
      sound.playCorrect();
      onSelectLanguage(lang);
      onClose();
    } catch (err) {
      console.error("Error switching course language:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#131f24] border-4 border-[#1cb0f6] rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl flex flex-col items-center gap-6">
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-[#777777] hover:text-[#3c3c3c] dark:hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-black text-[#3c3c3c] dark:text-[#f1f5f9] tracking-tight">
            Choose a Language Course
          </h2>
          <p className="text-xs font-semibold text-[#777777] dark:text-[#93a2a8] mt-1">
            Switch courses anytime! Your progress per course is saved automatically.
          </p>
        </div>

        {/* Language Grid */}
        <div className="flex flex-col gap-3 w-full max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-10 text-center font-bold text-[#777777]">Loading language courses...</div>
          ) : (
            languages.map((lang) => {
              const isSelected = currentLanguageId === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleSelect(lang)}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? "bg-[#ddf4ff] dark:bg-[#183642] border-[#1cb0f6] shadow-md scale-102"
                      : "bg-white dark:bg-[#18272c] border-[#e5e5e5] dark:border-[#37464f] hover:bg-[#f7f7f7] dark:hover:bg-[#202f36]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{lang.flag_icon}</span>
                    <div>
                      <h4 className="font-extrabold text-base text-[#3c3c3c] dark:text-[#f1f5f9]">
                        {lang.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#777777] dark:text-[#93a2a8]">
                        {lang.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-8 h-8 rounded-full bg-[#1cb0f6] text-white flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
