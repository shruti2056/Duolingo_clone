"use client";

import { BookOpen } from "lucide-react";
import { Unit } from "@/types";

interface UnitHeaderProps {
  unit: Unit;
}

export default function UnitHeader({ unit }: UnitHeaderProps) {
  const bgStyle = { backgroundColor: unit.color_hex || "#58cc02" };

  return (
    <div
      style={bgStyle}
      className="w-full rounded-2xl p-5 text-white shadow-md my-6 flex items-center justify-between transition-all"
    >
      <div>
        <h2 className="text-xl font-black tracking-tight">{unit.title}</h2>
        <p className="text-sm font-semibold opacity-90 mt-1">{unit.description}</p>
      </div>

      <button
        onClick={() => alert(`Guidebook for ${unit.title}:\n\n${unit.description}`)}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-xs backdrop-blur-sm transition-all border border-white/30"
      >
        <BookOpen className="w-4 h-4" />
        GUIDEBOOK
      </button>
    </div>
  );
}
