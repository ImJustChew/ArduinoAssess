// Database schema types for ArduinoAssess
// Based on the proposal's database schema section

export interface StudentProfile {
  id: string;
  name: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AssessmentSession {
  id: string;
  student_id: string;
  started_at: Date;
  completed_at?: Date;
  current_phase: 'exploration' | 'convergence' | 'complete';
  questions_answered: number;
  created_at: Date;
  updated_at: Date;
}

export interface DimensionState {
  id: string;
  assessment_id: string;
  dimension: 'low_level' | 'control_flow' | 'hardware_io' | 'code_reading' | 'decomposition';
  lower_bound: number;
  upper_bound: number;
  tested: boolean;
  questions_asked: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuestionResponse {
  id: string;
  assessment_id: string;
  question_id?: string;
  question_source: 'bank' | 'ai_generated';
  question_type: 'one_liner' | 'multiple_choice' | 'code_ide' | 'trace';
  dimension: 'low_level' | 'control_flow' | 'hardware_io' | 'code_reading' | 'decomposition';
  difficulty: number;
  question_data: any; // JSON
  student_answer: any; // JSON
  is_correct: boolean;
  correctness_level: 'wrong' | 'partial' | 'correct';
  time_spent_ms: number;
  hints_used: HintEvent[];
  keystroke_data?: KeystrokeEvent[];
  answered_at: Date;
  created_at: Date;
}

export interface HintEvent {
  timestamp: number;
  hint_type: 'conceptual' | 'syntax' | 'example' | 'strategic';
  hint_text: string;
  led_to_correct_answer: boolean;
}

export interface KeystrokeEvent {
  t: number; // timestamp offset in ms
  k: string; // key or action ('type', 'delete', 'paste', etc.)
  v?: string; // value (for type/paste)
  l?: number; // line number (optional)
  c?: number; // column number (optional)
}

export interface AITokenUsage {
  id: string;
  assessment_id: string;
  call_type: 'question_generation' | 'answer_evaluation' | 'hint_generation' | 'replay_analysis' | 'profile_generation';
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  created_at: Date;
}

export interface QuestionBankItem {
  id: string;
  dimension: 'low_level' | 'control_flow' | 'hardware_io' | 'code_reading' | 'decomposition';
  difficulty: number;
  question_type: 'one_liner' | 'multiple_choice' | 'code_ide' | 'trace';
  question_data: any; // JSON
  answer_data: any; // JSON (correct answer + rubric)
  usage_count: number;
  avg_time_ms: number;
  avg_correctness: number;
  created_at: Date;
  updated_at: Date;
}

export interface AssessmentResult {
  id: string;
  assessment_id: string;
  final_levels: {
    low_level: number;
    control_flow: number;
    hardware_io: number;
    code_reading: number;
    decomposition: number;
  };
  profile_summary: string;
  strengths: string[];
  growth_areas: string[];
  behavioral_insights: {
    help_seeking_style: 'independent' | 'hint_reliant' | 'balanced';
    avg_time_per_question_ms: number;
    most_effective_hint_type: string;
    problem_solving_approach: string;
  };
  total_time_ms: number;
  total_tokens_used: number;
  estimated_cost_usd: number;
  created_at: Date;
}

// Type for dimension keys
export type Dimension = 'low_level' | 'control_flow' | 'hardware_io' | 'code_reading' | 'decomposition';

// Type for question types
export type QuestionType = 'one_liner' | 'multiple_choice' | 'code_ide' | 'trace';

// Type for correctness levels
export type CorrectnessLevel = 'wrong' | 'partial' | 'correct';

// Type for assessment phases
export type AssessmentPhase = 'exploration' | 'convergence' | 'complete';
