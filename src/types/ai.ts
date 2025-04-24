export interface AIContentForm {
  content_type: "text" | "code" | "quiz" | "";
  custom_prompt: string;
  difficulty_level: "beginner" | "intermediate" | "advanced" | "";
  tone: "learning" | "professional" | "casual" | "";
  target_audience: "student" | "professional" | "general" | "";
  include_examples: boolean;
  include_exercises: boolean;
}

export interface AIContentResponse {
  content: string;
  examples?: string[];
  exercises?: string[];
  error?: string;
}
