export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  avatar_url: string;
  streak: number;
  last_active_date: string;
  xp: number;
  gems: number;
  hearts: number;
  max_hearts: number;
  current_language_id: number;
}

export interface ExerciseOptionMultipleChoice {
  text: string;
  subtext?: string;
  icon?: string;
}

export interface MatchPairOption {
  spanish: string;
  english: string;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  order: number;
  type: "MULTIPLE_CHOICE" | "TRANSLATE_TAP" | "TRANSLATE_TYPE" | "MATCH_PAIRS" | "FILL_BLANK";
  prompt: string;
  question: string;
  audio_text?: string;
  options: any; // string[], ExerciseOptionMultipleChoice[], MatchPairOption[]
  correct_answer: any;
  explanation?: string;
}

export interface Lesson {
  id: number;
  skill_id: number;
  order: number;
  title: string;
  xp_reward: number;
  exercises: Exercise[];
}

export interface Skill {
  id: number;
  unit_id: number;
  order: number;
  title: string;
  description: string;
  icon: string;
  total_lessons: number;
  lessons_completed: number;
  is_completed: boolean;
  is_unlocked: boolean;
  crown_level: number;
  is_legendary: boolean;
}

export interface Unit {
  id: number;
  language_id: number;
  order: number;
  title: string;
  description: string;
  color_hex: string;
  skills: Skill[];
}

export interface CoursePath {
  language_id: number;
  units: Unit[];
}

export interface LeaderboardUser {
  id: number;
  name: string;
  avatar_url: string;
  weekly_xp: number;
  league: string;
  is_current_user: boolean;
}

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  max_progress: number;
  current_progress: number;
  is_unlocked: boolean;
}

export interface Language {
  id: number;
  name: string;
  code: string;
  flag_icon: string;
  description: string;
}