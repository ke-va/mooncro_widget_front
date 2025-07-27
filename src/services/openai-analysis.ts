import { FormAnswers } from '../app/types/form';

interface AIAnalysis {
  score: number;
  rating: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  marketAnalysis: string;
  tractionAnalysis: string;
  teamAnalysis: string;
  riskFactors: string[];
  investmentRecommendation: string;
}

export const analyzeStartupWithAI = async (answers: FormAnswers): Promise<AIAnalysis> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answers),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Check if it's a quota/billing issue that should trigger fallback
      if (errorData.fallback) {
        throw new Error(`${errorData.error}: ${errorData.message}`);
      }
      
      throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const analysis = await response.json();
    
    // Validate the response structure
    if (!analysis.score && analysis.score !== 0) {
      throw new Error('Invalid analysis response structure');
    }
    
    return analysis;

  } catch (error) {
    console.error('AI Analysis API Error:', error);
    throw error;
  }
};

// Fallback analysis function (your original logic as backup)
export const analyzeStartupFallback = async (answers: FormAnswers): Promise<AIAnalysis> => {
  // Calculate basic score using your original logic
  let score = 0;
  
  // Short description scoring
  if (answers.short_description && answers.short_description.length > 50) score += 15;
  else if (answers.short_description && answers.short_description.length > 20) score += 10;
  else if (answers.short_description && answers.short_description.length > 0) score += 5;
  
  // Vision scoring
  if (answers.vision && answers.vision.length > 100) score += 20;
  else if (answers.vision && answers.vision.length > 50) score += 15;
  else if (answers.vision && answers.vision.length > 0) score += 8;
  
  // Market size scoring
  if (answers.market_size) {
    if (answers.market_size.toLowerCase().includes('billion')) score += 20;
    else if (answers.market_size.toLowerCase().includes('million')) score += 15;
    else if (answers.market_size.length > 50) score += 10;
    else if (answers.market_size.length > 0) score += 5;
  }
  
  // Traction scoring
  if (answers.traction) {
    if (answers.traction.toLowerCase().includes('revenue')) score += 20;
    else if (answers.traction.toLowerCase().includes('customers')) score += 15;
    else if (answers.traction.length > 50) score += 10;
    else if (answers.traction.length > 0) score += 5;
  }
  
  // Team scoring
  if (answers.team && answers.team.length > 100) score += 15;
  else if (answers.team && answers.team.length > 50) score += 10;
  else if (answers.team && answers.team.length > 0) score += 5;
  
  // Industry diversity bonus
  if (answers.industries && answers.industries.length > 2) score += 10;
  else if (answers.industries && answers.industries.length > 1) score += 7;
  else if (answers.industries && answers.industries.length > 0) score += 3;
  
  score = Math.min(score, 100);
  
  return {
    score,
    rating: score >= 80 ? 'High Potential' : score >= 60 ? 'Promising' : 'Needs Improvement',
    strengths: ['Analysis completed with basic scoring'],
    weaknesses: ['Limited analysis due to system error'],
    recommendations: ['Contact support for detailed analysis'],
    marketAnalysis: 'Basic market assessment completed',
    tractionAnalysis: 'Basic traction assessment completed',
    teamAnalysis: 'Basic team assessment completed',
    riskFactors: ['Analysis system unavailable'],
    investmentRecommendation: 'Manual review recommended'
  };
};