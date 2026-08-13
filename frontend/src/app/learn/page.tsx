"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import UnitHeader from "@/components/path/UnitHeader";
import SkillNode from "@/components/path/SkillNode";
import LessonPlayer from "@/components/lesson/LessonPlayer";
import OutOfHeartsModal from "@/components/modals/OutOfHeartsModal";

import { User, CoursePath, Lesson } from "@/types";
import { fetchUser, fetchCoursePath, fetchNextLesson, fetchLesson, refillHearts } from "@/lib/api";

export default function LearnPage() {
  const [user, setUser] = useState<User | null>(null);
  const [coursePath, setCoursePath] = useState<CoursePath | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uData, cData] = await Promise.all([fetchUser(), fetchCoursePath()]);
      setUser(uData);
      setCoursePath(cData);
    } catch (err) {
      console.error("Error loading path data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartSkill = async (skillId: number) => {
    if (user && user.hearts <= 0) {
      setShowHeartsModal(true);
      return;
    }

    try {
      // Fetch first available lesson for skill
      const lessonId = await fetchNextLesson(skillId);
      const lessonData = await fetchLesson(lessonId);
      setActiveLesson(lessonData);
    } catch (err) {
      console.error("Error starting lesson:", err);
    }
  };

  const handleRefillGems = async () => {
    try {
      const res = await refillHearts("gems");
      if (res.success) {
        setShowHeartsModal(false);
        loadData();
      }
    } catch (err) {
      console.error("Error refilling hearts:", err);
    }
  };

  // Serpentine offset horizontal trajectory pattern
  const horizontalOffsets = [0, 45, 80, 45, 0, -45, -80, -45];

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#131f24] text-[#3c3c3c] dark:text-[#f1f5f9] flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Path Container */}
      <div className="flex-1 md:ml-64 flex flex-col items-center pb-24">
        {/* Top Header */}
        <TopNav user={user} onRefillHearts={() => setShowHeartsModal(true)} />

        {/* Learning Path */}
        <main className="w-full max-w-xl px-4 py-6 flex flex-col items-center">
          {loading ? (
            <div className="py-20 text-center font-extrabold text-[#777777] animate-pulse">
              Loading your Duolingo learning path...
            </div>
          ) : coursePath && coursePath.units ? (
            coursePath.units.map((unit) => (
              <div key={unit.id} className="w-full flex flex-col items-center">
                {/* Unit Banner Header */}
                <UnitHeader unit={unit} />

                {/* Serpentine Skill Tree Path */}
                <div className="flex flex-col items-center my-4 w-full">
                  {unit.skills.map((skill, idx) => {
                    const offset = horizontalOffsets[idx % horizontalOffsets.length];
                    return (
                      <SkillNode
                        key={skill.id}
                        skill={skill}
                        horizontalOffset={offset}
                        unitColor={unit.color_hex}
                        onStartLesson={handleStartSkill}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center font-bold text-red-500">
              Failed to load course path. Make sure backend is running!
            </div>
          )}
        </main>
      </div>

      {/* Interactive Lesson Player Overlay */}
      {activeLesson && user && (
        <LessonPlayer
          lesson={activeLesson}
          userHearts={user.hearts}
          userGems={user.gems}
          userStreak={user.streak}
          onClose={() => setActiveLesson(null)}
          onFinishLesson={() => {
            setActiveLesson(null);
            loadData();
          }}
        />
      )}

      {/* Out Of Hearts Modal */}
      {showHeartsModal && user && (
        <OutOfHeartsModal
          gems={user.gems}
          onRefillWithGems={handleRefillGems}
          onPracticeRefill={async () => {
            await refillHearts("practice");
            setShowHeartsModal(false);
            loadData();
          }}
          onClose={() => setShowHeartsModal(false)}
        />
      )}
    </div>
  );
}
