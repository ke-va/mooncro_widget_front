import { Question } from '../types/form';

// General Questions
export const generalQuestions: Question[] = [
  {
    id: 'short_description',
    text: 'In one sentence, describe what your company does.',
    required: true,
    type: 'textarea',
    number: 1
  },
  {
    id: 'vision',
    text: 'What is your plan to succeed and differentiate your company in the market?',
    required: true,
    type: 'textarea',
    number: 2
  },
  {
    id: 'market_size',
    text: 'How large is the market you are targeting? Please include any relevant data or estimates.',
    required: true,
    type: 'textarea',
    number: 3
  },
  {
    id: 'pain_point_usp',
    text: 'What problem are you solving? Who are your competitors? What makes your solution unique?',
    required: true,
    type: 'textarea',
    number: 4
  },
  {
    id: 'traction',
    text: 'Are you currently generating revenue? If yes, describe your business model, recent revenue figures, and your typical customer. If not, please share any progress or milestones.',
    required: true,
    type: 'textarea',
    number: 5
  },
  {
    id: 'team',
    text: 'How many people are on your team? Where are you located? Who works full-time and part-time? Why is your team well-positioned to succeed?',
    required: true,
    type: 'textarea',
    number: 6
  },
  {
    id: 'previous_investments',
    text: 'Is this your first funding round? If not, describe previous investments, including amounts raised, valuations, timing, and investors.',
    required: true,
    type: 'textarea',
    number: 7
  },
  {
    id: 'ask_valuation',
    text: 'How much capital are you currently seeking? What valuation are you targeting? Do you have any commitments? When do you plan to close this round?',
    required: true,
    type: 'textarea',
    number: 8
  },
  {
    id: 'use_of_proceeds',
    text: 'How will you use the funds you are raising? What milestones or goals will this funding help you achieve?',
    required: true,
    type: 'textarea',
    number: 9
  },
  {
    id: 'exit_potential',
    text: 'What is your expected exit strategy? Who do you think might buy your company or how will investors see a return?',
    required: true,
    type: 'textarea',
    number: 10
  },
  {
    id: 'pitch_deck',
    text: 'Please upload your latest pitch deck in PDF format.',
    required: true,
    type: 'file',
    number: 11
  }
];

// Industry Selection
export const industryOptions = [
  'SaaS / B2B',
  'Fintech',
  'HealthTech',
  'MedTech',
  'Biotech',
  'Marketplace',
  'AI / Machine Learning',
  'Cleantech / Energy',
  'AgTech / FoodTech',
  'EdTech',
  'Mobility',
  'GovTech',
  'Web3 / Blockchain'
];