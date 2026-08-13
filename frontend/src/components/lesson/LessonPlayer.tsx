"use client";

import { useState, useEffect } from "react";
import { X, Heart } from "lucide-react";
import { Lesson, Exercise } from "@/types";
import { checkExercise, completeLesson, decrementHeart, refillHearts } from "@/lib/api";
import { sound } from "@/lib/audio";

import ExerciseTranslateTap from "./ExerciseTranslateTap";
import ExerciseMultipleChoice from "./ExerciseMultipleChoice";
import ExerciseMatchPairs from "./ExerciseMatchPairs";
import ExerciseFillBlank from "./ExerciseFillBlank";
import ExerciseTranslateType from "./ExerciseTranslateType";
import BottomFeedbackBar from "./BottomFeedbackBar";
import LessonCompleteModal from "./LessonCompleteModal";
import OutOfHeartsModal from "../modals/OutOfHeartsModal";

interface LessonPlayerProps {
  lesson: Lesson;
  userHearts: number;
  userGems: number;
  userStreak: number;
  onClose: () => void;
  onFinishLesson: () => void;
}

export default function LessonPlayer({
  lesson,
  userHearts,
  userGems,
  userStreak,
  onClose,
  onFinishLesson,
}: LessonPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [correctAnswer, setCorrectAnswer] = useState<any>(null);
  const [explanation, setExplanation] = useState<string | undefined>(undefined);

  const [hearts, setHearts] = useState(userHearts);
  const [gems, setGems] = useState(userGems);
  const [mistakes, setMistakes] = useState(0);
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedXp, setCompletedXp] = useState(15);
  const [isHeartShaking, setIsHeartShaking] = useState(false);

  const exercises = lesson.exercises || [];
  const currentExercise: Exercise | undefined = exercises[currentIdx];

  // Reset exercise state when exercise index changes
  useEffect(() => {
    setUserAnswer(null);
    setFeedbackStatus("idle");
    setCorrectAnswer(null);
    setExplanation(undefined);
  }, [currentIdx]);

  const handleCheck = async () => {
    if (!currentExercise || userAnswer === null) return;

    try {
      const res = await checkExercise(currentExercise.id, userAnswer);
      if (res.is_correct) {
        sound.playCorrect();
        setFeedbackStatus("correct");
        setExplanation(res.explanation);
      } else {
        sound.playIncorrect();
        sound.playHeartLost();
        setFeedbackStatus("incorrect");
        setCorrectAnswer(res.correct_answer);
        setExplanation(res.explanation);
        setMistakes((prev) => prev + 1);

        // Shake heart animation & decrement heart count
        setIsHeartShaking(true);
        setTimeout(() => setIsHeartShaking(false), 500);

        const hRes = await decrementHeart();
        setHearts(hRes.hearts);

        if (hRes.hearts <= 0) {
          setShowOutOfHearts(true);
        }
      }
    } catch (err) {
      console.error("Error checking exercise:", err);
    }
  };

  const handleContinue = async () => {
    sound.playTap();
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Last exercise completed! Submit lesson results to backend
      const totalExercises = exercises.length;
      const accuracy = totalExercises > 0 ? (totalExercises - mistakes) / totalExercises : 1.0;

      try {
        const res = await completeLesson(lesson.id, lesson.xp_reward, accuracy, mistakes);
        setCompletedXp(res.xp_earned);
        setShowCompletionModal(true);
      } catch (err) {
        console.error("Error completing lesson:", err);
        onFinishLesson();
      }
    }
  };

  const handleRefillGems = async () => {
    try {
      const res = await refillHearts("gems");
      if (res.success) {
        setHearts(res.hearts);
        setGems(res.gems);
        setShowOutOfHearts(false);
      }
    } catch (err) {
      console.error("Error refilling hearts:", err);
    }
  };

  const isCheckDisabled =
    userAnswer === null ||
    (Array.isArray(userAnswer) && userAnswer.length === 0) ||
    (typeof userAnswer === "string" && userAnswer.trim() === "");

  const progressPercent = exercises.length > 0 ? ((currentIdx + 1) / exercises.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#131f24] flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-4 mb-6">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            if (confirm("Are you sure you want to quit this lesson? Your progress will be lost.")) {
              onClose();
            }
          }}
          className="text-[#777777] dark:text-[#93a2a8] hover:text-[#3c3c3c] dark:hover:text-white p-2 rounded-xl transition-all"
        >
          <X className="w-7 h-7" />
        </button>

        {/* Animated Progress Bar */}
        <div className="w-full h-4 bg-[#e5e5e5] dark:bg-[#37464f] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#58cc02] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts Widget */}
        <div
          className={`flex items-center gap-1.5 font-black text-base text-[#ff4b4b] ${
            isHeartShaking ? "animate-bounce" : ""
          }`}
        >
          <Heart className="w-7 h-7 fill-[#ff4b4b]" />
          <span>{hearts}</span>
        </div>
      </div>

      {/* Main Active Exercise Slot */}
      <main className="w-full my-auto py-4">
        {currentExercise ? (
          <>
            {currentExercise.type === "TRANSLATE_TAP" && (
              <ExerciseTranslateTap
                exercise={currentExercise}
                selectedWords={Array.isArray(userAnswer) ? userAnswer : []}
                onChange={(words) => setUserAnswer(words)}
              />
            )}

            {currentExercise.type === "MULTIPLE_CHOICE" && (
              <ExerciseMultipleChoice
                exercise={currentExercise}
                selectedOption={typeof userAnswer === "string" ? userAnswer : null}
                onChange={(opt) => setUserAnswer(opt)}
              />
            )}

            {currentExercise.type === "MATCH_PAIRS" && (
              <ExerciseMatchPairs
                exercise={currentExercise}
                onChange={(pairs) => setUserAnswer(pairs)}
              />
            )}

            {currentExercise.type === "FILL_BLANK" && (
              <ExerciseFillBlank
                exercise={currentExercise}
                selectedOption={typeof userAnswer === "string" ? userAnswer : null}
                onChange={(opt) => setUserAnswer(opt)}
              />
            )}

            {currentExercise.type === "TRANSLATE_TYPE" && (
              <ExerciseTranslateType
                exercise={currentExercise}
                value={typeof userAnswer === "string" ? userAnswer : ""}
                onChange={(val) => setUserAnswer(val)}
              />
            )}
          </>
        ) : (
          <div className="text-center font-bold text-lg text-[#777777]">Loading exercise...</div>
        )}
      </main>

      {/* Bottom Feedback Bar */}
      <BottomFeedbackBar
        status={feedbackStatus}
        correctAnswer={correctAnswer}
        explanation={explanation}
        isCheckDisabled={isCheckDisabled}
        onCheck={handleCheck}
        onContinue={handleContinue}
      />

      {/* Out Of Hearts Modal */}
      {showOutOfHearts && (
        <OutOfHeartsModal
          gems={gems}
          onRefillWithGems={handleRefillGems}
          onPracticeRefill={() => {
            setShowOutOfHearts(false);
            setHearts(1);
          }}
          onClose={onClose}
        />
      )}

      {/* Lesson Complete Modal */}
      {showCompletionModal && (
        <LessonCompleteModal
          xpEarned={completedXp}
          accuracy={exercises.length > 0 ? (exercises.length - mistakes) / exercises.length : 1.0}
          streak={userStreak}
          onClose={onFinishLesson}
        />
      )}
    </div>
  );
}
