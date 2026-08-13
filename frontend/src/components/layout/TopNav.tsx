"use client";
import { useState, useEffect } from "react";
import { Flame, Gem, Heart, Moon, Sun, ChevronDown } from "lucide-react";
import { User } from "@/types";
import { fetchLanguages, switchLanguage } from "@/lib/api";
import { sound } from "@/lib/audio";

interface TopNavProps { user: User | null; onRefillHearts?: () => void; }
export default function TopNav({ user, onRefillHearts }: TopNavProps) {
  const [darkMode,setDarkMode]=useState(false);
  const [languages,setLanguages]=useState<any[]>([]);
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    const saved=localStorage.getItem("duo_theme");
    const dark=saved==="dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark",dark); setDarkMode(dark);
    fetchLanguages().then(setLanguages).catch(()=>{});
  },[]);
  const toggle=()=>{ sound.playTap(); const next=!darkMode; document.documentElement.classList.toggle("dark",next); localStorage.setItem("duo_theme",next?"dark":"light"); setDarkMode(next); };
  const current=languages.find(l=>l.id===user?.current_language_id) || languages[0];
  const choose=async(id:number)=>{ try { await switchLanguage(id); window.location.reload(); } catch(e){ console.error(e); } };

  return <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-[#131f24]/90 backdrop-blur-md border-b-2 border-[#e5e5e5] dark:border-[#37464f] px-4 py-3 flex items-center justify-between max-w-4xl mx-auto rounded-b-2xl">
    <div className="relative">
      <button onClick={()=>setOpen(!open)} className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 border-transparent hover:border-[#e5e5e5] dark:hover:border-[#37464f]">
        <span className="text-2xl">{current?.flag_icon || "🇪🇸"}</span>
        <span className="font-extrabold text-sm text-[#4b4b4b] dark:text-[#f1f5f9] hidden sm:inline">{current?.name || "Spanish"}</span>
        <ChevronDown className="w-4 h-4"/>
      </button>
      {open && <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-[#18272c] border-2 border-[#e5e5e5] dark:border-[#37464f] rounded-2xl p-2 shadow-xl z-50">
        {languages.map(l=><button key={l.id} onClick={()=>choose(l.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f7f7f7] dark:hover:bg-[#202f36] text-left font-bold">
          <span className="text-xl">{l.flag_icon}</span><span>{l.name}</span>
        </button>)}
      </div>}
    </div>
    <div className="flex items-center gap-4 sm:gap-6">
      <div className="flex items-center gap-1.5 font-black text-sm text-[#ff9600]"><Flame className="w-6 h-6 fill-[#ff9600]"/><span>{user?.streak || 0}</span></div>
      <div className="flex items-center gap-1.5 font-black text-sm text-[#1cb0f6]"><Gem className="w-6 h-6 fill-[#1cb0f6]"/><span>{user?.gems || 0}</span></div>
      <button onClick={onRefillHearts} className="flex items-center gap-1.5 font-black text-sm text-[#ff4b4b] hover:bg-[#ffdadc] dark:hover:bg-[#3a1a1c] px-2.5 py-1 rounded-xl"><Heart className="w-6 h-6 fill-[#ff4b4b]"/><span>{user?.hearts ?? 5}</span></button>
      <button onClick={toggle} aria-label="Toggle dark mode" className="p-2 rounded-xl border-2 border-[#e5e5e5] dark:border-[#37464f] hover:bg-[#f7f7f7] dark:hover:bg-[#202f36]">{darkMode?<Sun className="w-5 h-5 text-[#ffc800]"/>:<Moon className="w-5 h-5"/>}</button>
    </div>
  </header>;
}
