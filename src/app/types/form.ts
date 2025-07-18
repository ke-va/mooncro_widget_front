export interface Question {
  id: string;
  text: string;
  required: boolean;
  type: 'text' | 'textarea' | 'number' | 'file' | 'select' | 'multiselect' | 'checkbox';
  options?: string[];
  number?: number;
}

export interface QuestionSection {
  title: string;
  questions: Question[];
}

export type FormData = {
  short_description: string;
  vision: string;
  market_size: string;
  pain_point_usp: string;
  traction: string;
  team: string;
  previous_investments: string;
  ask_valuation: string;
  use_of_proceeds: string;
  exit_potential: string;
  pitch_deck: string;
  industries: string[];
  [key: string]: string | string[];
}; 