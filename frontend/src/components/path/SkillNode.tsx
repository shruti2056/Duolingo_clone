"use client";

import { useState } from "react";
import { Lock, Crown, Star, Book, Coffee, Utensils, MessageCircle, Users, ShoppingBag, Dumbbell } from "lucide-react";
import { Skill } from "@/types";
import { sound } from "@/lib/audio";

interface SkillNodeProps {
  skill: Skill;
  horizontalOffset: number; // Horizontal offset in pixels for serpentine curve
  unitColor: string;
  onStartLesson: (skillId: number) => void;
}

const iconMap: Record<string, any> = {
  book: Book,
  coffee: Coffee,
  utensils: Utensils,
  "message-circle": MessageCircle,
  users: Users,
  "shopping-bag": ShoppingBag,
  dumbbell: Dumbbell,
};

export default function SkillNode({ skill, horizontalOffset, unitColor, onStartLesson }: SkillNodeProps) {
  const [showPopover, setShowPopover] = useState(false);
  const IconComponent = iconMap[skill.icon] || Star;

  const progressPercent = (skill.lessons_completed / skill.total_lessons) * 100;
  const isLocked = !skill.is_unlocked;
  const isCompleted = skill.is_completed;

  const handleClick = () => {
    sound.playTap();
    if (isLocked) return;
    setShowPopover(!showPopover);
  };

  return (
    <div
      className="relative flex flex-col items-center my-4 transition-transform duration-300"
      style={{ transform: `translateX(${horizontalOffset}px)` }}
    >
      {/* Popover Menu when Node Clicked */}
      {showPopover && !isLocked && (
        <div className="absolute -top-32 z-50 bg-[#58cc02] text-white p-4 rounded-2xl shadow-2xl w-60 text-center animate-in fade-in zoom-in-95 duration-150 border-4 border-[#46a302]">
          <h4 className="font-extrabold text-base mb-1">{skill.title}</h4>
          <p className="text-xs font-semibold opacity-90 mb-3">
            {isCompleted ? "Skill Mastered!" : `Lesson ${skill.lessons_completed + 1} of ${skill.total_lessons}`}
          </p>

          <button
            onClick={() => {
              sound.playTap();
              onStartLesson(skill.id);
            }}
            className="w-full py-2.5 px-4 bg-white text-[#58cc02] font-black text-sm rounded-xl border-b-4 border-[#e5e5e5] hover:brightness-105 active:translate-y-1 active:border-b-0 transition-all uppercase tracking-wider"
          >
            {isCompleted ? "PRACTICE +10 XP" : "START +15 XP"}
          </button>
        </div>
      )}

      {/* Main Circular Node Button */}
      <button
        onClick={handleClick}
        disabled={isLocked}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          isLocked
            ? "bg-[#e5e5e5] dark:bg-[#37464f] border-b-8 border-[#cecece] dark:border-[#202f36] cursor-not-allowed"
            : isCompleted
            ? "bg-[#ffc800] border-b-8 border-[#e5b200] shadow-lg animate-pulse"
            : "bg-[#58cc02] border-b-8 border-[#46a302] shadow-xl hover:brightness-110 active:translate-y-2 active:border-b-0"
        }`}
      >
        {/* SVG Progress Ring */}
        {!isLocked && (
          <svg className="absolute top-0 left-0 w-20 h-20 -rotate-90 pointer-events-none" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="white"
              strokeWidth="6"
              strokeOpacity="0.2"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#ffffff"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 36}
              strokeDashoffset={2 * Math.PI * 36 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
        )}

        {/* Crown Badge */}
        {skill.crown_level > 0 && (
          <div className="absolute -top-2 -right-1 bg-[#ffc800] border-2 border-white rounded-full p-1 shadow-md">
            <Crown className="w-4 h-4 fill-white text-white" />
          </div>
        )}

        {/* Node Icon */}
        {isLocked ? (
          <Lock className="w-8 h-8 text-[#afafaf] dark:text-[#52656d]" />
        ) : isCompleted ? (
          <Crown className="w-9 h-9 fill-white text-white" />
        ) : (
          <IconComponent className="w-9 h-9 text-white" />
        )}
      </button>

      {/* Skill Label below */}
      <span className="mt-2 font-black text-xs text-[#4b4b4b] dark:text-[#93a2a8] tracking-wide">
        {skill.title}
      </span>
    </div>
  );
}
