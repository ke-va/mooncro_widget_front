import { Question } from '../types/form';
import { industryOptions } from './questions';

export const industrySelection: Question = {
  id: 'industries',
  text: 'Select all industries your startup operates in:',
  required: true,
  type: 'multiselect',
  options: industryOptions
};

export const saasB2BQuestions: Question[] = [
  {
    id: 'cac',
    text: 'What is your average Customer Acquisition Cost (CAC)?',
    required: false,
    type: 'text'
  },
  {
    id: 'churn_rate',
    text: 'What is your churn rate (%)?',
    required: false,
    type: 'number'
  },
  {
    id: 'mrr',
    text: 'What is your Monthly Recurring Revenue (MRR)?',
    required: false,
    type: 'text'
  },
  {
    id: 'integrations',
    text: 'What integrations do you offer with major platforms (e.g., Salesforce, Slack)?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'contract_length',
    text: 'What is your average contract length (in months)?',
    required: false,
    type: 'number'
  }
];

export const fintechQuestions: Question[] = [
  {
    id: 'regulated_licensed',
    text: 'Are you regulated or licensed by any financial authority?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'aml_kyc',
    text: 'Do you have AML and KYC procedures in place?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'banking_partners',
    text: 'Which banking or payment partners do you work with?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'transaction_volume',
    text: 'What is your total monthly transaction volume?',
    required: false,
    type: 'text'
  },
  {
    id: 'risk_management',
    text: 'Describe your risk management policies.',
    required: false,
    type: 'textarea'
  }
];

export const healthTechQuestions: Question[] = [
  {
    id: 'fda_ce_certification',
    text: 'Have you received FDA or CE certification for your product?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'clinical_trials',
    text: 'Have you completed any clinical trials?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'patient_data_privacy',
    text: 'How do you ensure patient data privacy and security?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'healthcare_partnerships',
    text: 'What partnerships do you have with healthcare providers?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'medical_device_classification',
    text: 'Is your product classified as a medical device?',
    required: false,
    type: 'textarea'
  }
];

export const medTechQuestions: Question[] = [
  {
    id: 'regulatory_approval_status',
    text: 'What is your current regulatory approval status (e.g., FDA, CE)?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'regulatory_timeline',
    text: 'What is the timeline for your next regulatory milestone?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'manufacturing_capabilities',
    text: 'Do you have manufacturing capabilities or partnerships?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'distribution_strategy',
    text: 'What is your distribution strategy?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'pilot_studies',
    text: 'Have you conducted any pilot studies or validations?',
    required: false,
    type: 'textarea'
  }
];

export const biotechQuestions: Question[] = [
  {
    id: 'research_stage',
    text: 'What stage is your research or product in?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'patents_ip',
    text: 'Do you hold any patents or intellectual property related to your biotech innovations?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'funding_grants',
    text: 'Describe your funding sources and any grants received.',
    required: false,
    type: 'textarea'
  },
  {
    id: 'research_collaborations',
    text: 'What collaborations do you have with research institutions?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'timeline_to_market',
    text: 'What is your expected timeline to market?',
    required: false,
    type: 'textarea'
  }
];

export const marketplaceQuestions: Question[] = [
  {
    id: 'buyers_sellers_count',
    text: 'How many buyers and sellers are on your platform?',
    required: false,
    type: 'text'
  },
  {
    id: 'average_transaction_value',
    text: 'What is your average transaction value?',
    required: false,
    type: 'text'
  },
  {
    id: 'take_rate',
    text: 'What is your take rate or commission percentage?',
    required: false,
    type: 'text'
  },
  {
    id: 'dispute_handling',
    text: 'How do you handle disputes between parties?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'monthly_gmv',
    text: 'What is your monthly Gross Merchandise Volume (GMV)?',
    required: false,
    type: 'text'
  }
];

export const aiMlQuestions: Question[] = [
  {
    id: 'ai_models',
    text: 'Describe the AI models or algorithms you use.',
    required: false,
    type: 'textarea'
  },
  {
    id: 'data_sources',
    text: 'What data sources are used to train your AI?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'bias_validation',
    text: 'How do you address model bias and ensure validation?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'proprietary_datasets',
    text: 'Do you own any proprietary datasets?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'ai_deployment',
    text: 'How is your AI deployed (cloud, edge, on-premise)?',
    required: false,
    type: 'textarea'
  }
];

export const cleantechEnergyQuestions: Question[] = [
  {
    id: 'clean_energy_problem',
    text: 'What specific problem in clean energy or sustainability do you address?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'technology_impact',
    text: 'Describe your technology and its environmental impact.',
    required: false,
    type: 'textarea'
  },
  {
    id: 'gov_regulatory_approvals',
    text: 'Do you have government or regulatory approvals?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'utility_partnerships',
    text: 'What partnerships do you have with utilities or government agencies?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'energy_savings_projection',
    text: 'What is your projected energy savings or emission reduction?',
    required: false,
    type: 'textarea'
  }
];

export const agTechFoodTechQuestions: Question[] = [
  {
    id: 'agricultural_problem',
    text: 'What agricultural or food industry problem do you solve?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'technology_deployment',
    text: 'Describe your technology and how it is deployed.',
    required: false,
    type: 'textarea'
  },
  {
    id: 'field_trials',
    text: 'Do you have field trials or pilot programs?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'regulatory_approvals_required',
    text: 'What regulatory approvals are required?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'geographic_scaling',
    text: 'How do you plan to scale your solution geographically?',
    required: false,
    type: 'textarea'
  }
];

export const edTechQuestions: Question[] = [
  {
    id: 'learner_demographic',
    text: 'What learner demographic do you target?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'educational_partnerships',
    text: 'Do you have partnerships with educational institutions?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'learning_outcomes',
    text: 'How do you measure learning outcomes?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'content_creation',
    text: 'Describe your content creation and curation process.',
    required: false,
    type: 'textarea'
  },
  {
    id: 'pricing_model',
    text: 'What is your pricing or licensing model?',
    required: false,
    type: 'textarea'
  }
];

export const mobilityQuestions: Question[] = [
  {
    id: 'mobility_challenges',
    text: 'What mobility challenges are you addressing (e.g., ride-sharing, EV infrastructure)?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'technology_platform',
    text: 'Describe your technology platform.',
    required: false,
    type: 'textarea'
  },
  {
    id: 'transportation_compliance',
    text: 'How do you ensure compliance with transportation regulations?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'fleet_management',
    text: 'What is your fleet or asset management strategy?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'market_expansion',
    text: 'What are your plans for market expansion?',
    required: false,
    type: 'textarea'
  }
];

export const govTechQuestions: Question[] = [
  {
    id: 'government_targets',
    text: 'Which government agencies or departments are you targeting?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'government_compliance',
    text: 'How do you comply with government standards and regulations?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'government_data_privacy',
    text: 'How do you manage data privacy and security for government clients?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'government_contracts',
    text: 'Do you have existing government contracts or pilot projects?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'public_sector_scaling',
    text: 'What is your plan for scaling in the public sector?',
    required: false,
    type: 'textarea'
  }
];

export const web3BlockchainQuestions: Question[] = [
  {
    id: 'blockchain_protocols',
    text: 'Which blockchain protocol(s) do you use?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'tokenomics',
    text: 'Describe your tokenomics and utility token design.',
    required: false,
    type: 'textarea'
  },
  {
    id: 'smart_contract_audit',
    text: 'Have your smart contracts been audited?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'decentralization_level',
    text: 'How decentralized is your network or platform?',
    required: false,
    type: 'textarea'
  },
  {
    id: 'regulatory_challenges',
    text: 'What regulatory challenges have you addressed?',
    required: false,
    type: 'textarea'
  }
];

export const industryQuestions: Record<string, Question[]> = {
  'SaaS / B2B': saasB2BQuestions,
  'Fintech': fintechQuestions,
  'HealthTech': healthTechQuestions,
  'MedTech': medTechQuestions,
  'Biotech': biotechQuestions,
  'Marketplace': marketplaceQuestions,
  'AI / Machine Learning': aiMlQuestions,
  'Cleantech / Energy': cleantechEnergyQuestions,
  'AgTech / FoodTech': agTechFoodTechQuestions,
  'EdTech': edTechQuestions,
  'Mobility': mobilityQuestions,
  'GovTech': govTechQuestions,
  'Web3 / Blockchain': web3BlockchainQuestions
};

export function getQuestionsForIndustries(selectedIndustries: string[]): Question[] {
  return selectedIndustries.flatMap(industry => industryQuestions[industry] || []);
} 