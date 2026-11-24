export type PageView =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'academy'
  | 'ctf'
  | 'leaderboard'
  | 'events'
  | 'profile'
  | 'admin';

export interface User {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: 'student' | 'admin';
  student_id: string;
  year_level: string;
  bio: string;
  total_points: number;
  is_active: number;
  created_at: string;
}

export interface AcademyModule {
  id: number;
  slug: string;
  name: string;
  description: string;
  level: string;
  sort_order: number;
  lesson_count?: number;
  total_lessons?: number;
  completed_lessons?: number;
}

export interface LessonSummary {
  id: number;
  category_id: number;
  module_slug: string;
  module_name: string;
  slug: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate';
  duration_minutes: number;
  sort_order: number;
  completed: number;
  quiz_score?: number | null;
  quiz_total?: number | null;
}

export interface LessonDetail {
  id: number;
  category_id: number;
  module_slug: string;
  module_name: string;
  slug: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate';
  duration_minutes: number;
  objectives: string[];
  explanation: string;
  examples: string;
  exercise_prompt: string;
  exercise_command_hint: string;
  attachment_name?: string | null;
  quiz: { question: string; options: string[] }[];
  completed: boolean;
  progress: { quiz_score: number; quiz_total: number; completed_at: string } | null;
}

export interface ChallengeCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface ChallengeSummary {
  id: number;
  category_id: number;
  category_slug: string;
  category_name: string;
  slug: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  points: number;
  description: string;
  instructions: string;
  download_file?: string | null;
  sandbox_preset?: string | null;
  solves_count: number;
  is_solved: number;
}

export interface ChallengeHint {
  id: number;
  cost_points: number;
  sort_order: number;
  hint_text: string | null;
  is_unlocked: number;
}

export interface CtfEvent {
  id: number;
  slug: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  location: string;
  participant_count?: number;
  is_registered?: number;
}

export interface Announcement {
  id: number;
  title: string;
  category: string;
  content: string;
  pinned: number;
  created_at: string;
}

export interface ResourceItem {
  id: number;
  title: string;
  category: string;
  description: string;
  file_name: string;
  created_at: string;
}

export interface LeaderboardPlayer {
  id: number;
  full_name: string;
  username: string;
  year_level: string;
  total_points: number;
  challenges_solved: number;
  lessons_completed: number;
  created_at: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
}

export interface DashboardPayload {
  stats: {
    totalLessons: number;
    completedLessons: number;
    totalChallenges: number;
    completedChallenges: number;
    totalPoints: number;
    rank: number;
  };
  badges: BadgeItem[];
  recommendedLessons: {
    id: number;
    slug: string;
    title: string;
    difficulty: string;
    duration_minutes: number;
    module_slug: string;
    module_name: string;
  }[];
  announcements: Announcement[];
  activities: { id: number; action_type: string; summary: string; created_at: string }[];
  moduleProgress: {
    id: number;
    slug: string;
    name: string;
    total_lessons: number;
    completed_lessons: number;
  }[];
}
