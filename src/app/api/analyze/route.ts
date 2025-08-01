import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface FormAnswers {
  startup_name?: string;
  short_description?: string;
  vision?: string;
  market_size?: string;
  pain_point_usp?: string;
  traction?: string;
  team?: string;
  industries?: string[];
  ask_valuation?: string;
  use_of_proceeds?: string;
  exit_potential?: string;
}

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

interface APIError extends Error {
  status?: number;
  code?: string;
  type?: string;
}

// Type guard to check if error has API error properties
function isAPIError(error: unknown): error is APIError {
  return error instanceof Error;
}

// Initialize OpenAI client (server-side)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Quick toggle to disable AI analysis for testing
    const AI_ENABLED = process.env.ENABLE_AI_ANALYSIS !== 'false';
    
    if (!AI_ENABLED) {
      console.log('AI Analysis disabled, using fallback');
      return NextResponse.json(
        { 
          error: 'AI_DISABLED',
          message: 'AI analysis disabled for testing. Using fallback analysis.',
          fallback: true
        },
        { status: 500 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { 
          error: 'API_KEY_MISSING',
          message: 'OpenAI API key not configured. Using fallback analysis.',
          fallback: true
        },
        { status: 500 }
      );
    }

    const answers: FormAnswers = await request.json();

    // Validate required fields
    if (!answers.short_description && !answers.vision && !answers.market_size) {
      return NextResponse.json(
        { error: 'Insufficient data for analysis' },
        { status: 400 }
      );
    }

    const prompt = `You are a senior venture capital analyst with 15+ years of experience evaluating startups. 
    
Analyze this startup pitch comprehensively and provide a professional investment evaluation. 
Be thorough, specific, and realistic in your assessment.

STARTUP INFORMATION:
- Company Name: ${answers.startup_name || 'Not provided'}
- Business Description: ${answers.short_description || 'Not provided'}
- Vision: ${answers.vision || 'Not provided'}
- Market Size: ${answers.market_size || 'Not provided'}
- Pain Point/USP: ${answers.pain_point_usp || 'Not provided'}
- Current Traction: ${answers.traction || 'Not provided'}
- Team: ${answers.team || 'Not provided'}
- Target Industries: ${answers.industries?.join(', ') || 'Not provided'}
- Funding Ask & Valuation: ${answers.ask_valuation || 'Not provided'}
- Use of Proceeds: ${answers.use_of_proceeds || 'Not provided'}
- Exit Potential: ${answers.exit_potential || 'Not provided'}

ANALYSIS REQUIREMENTS:
1. Overall Score: Rate 0-100 based on investment potential
2. Rating: "High Potential" (80+), "Promising" (60-79), or "Needs Improvement" (<60)
3. Identify 3-6 key strengths
4. Identify 3-5 main weaknesses/areas for improvement
5. Provide 4-6 specific, actionable recommendations
6. List 3-4 main risk factors
7. Detailed analysis of: Market opportunity, Traction/business model, Team capability
8. Final investment recommendation

Consider: Market size & growth, product-market fit, team experience, competitive advantage, 
scalability, financial projections, exit potential, and overall execution capability.

Return ONLY valid JSON in this exact format:
{
  "score": 75,
  "rating": "Promising",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"], 
  "recommendations": ["rec1", "rec2", "rec3"],
  "riskFactors": ["risk1", "risk2", "risk3"],
  "marketAnalysis": "detailed market analysis paragraph",
  "tractionAnalysis": "detailed traction analysis paragraph",
  "teamAnalysis": "detailed team analysis paragraph", 
  "investmentRecommendation": "final investment recommendation with clear action"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Even cheaper model
      messages: [
        {
          role: "system",
          content: "You are a professional VC analyst. Respond only with valid JSON. Be thorough but concise in your analysis."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000, // Further reduced to control costs
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI Response:', content); // Debug log

    let analysis: AIAnalysis;
    try {
      analysis = JSON.parse(content) as AIAnalysis;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw OpenAI Response:', content);
      throw new Error(`Invalid JSON response from OpenAI: ${content.substring(0, 100)}...`);
    }
    
    // Validate and sanitize the response
    const sanitizedAnalysis = {
      score: Math.min(Math.max(analysis.score || 0, 0), 100),
      rating: analysis.rating || 'Needs Analysis',
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths.slice(0, 6) : [],
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses.slice(0, 5) : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations.slice(0, 6) : [],
      riskFactors: Array.isArray(analysis.riskFactors) ? analysis.riskFactors.slice(0, 4) : [],
      marketAnalysis: analysis.marketAnalysis || 'Market analysis unavailable',
      tractionAnalysis: analysis.tractionAnalysis || 'Traction analysis unavailable',
      teamAnalysis: analysis.teamAnalysis || 'Team analysis unavailable',
      investmentRecommendation: analysis.investmentRecommendation || 'Manual review recommended'
    };

    return NextResponse.json(sanitizedAnalysis);

  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);
    
    if (isAPIError(error)) {
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type
      });
      
      // Handle specific OpenAI errors
      if (error.status === 429) {
        return NextResponse.json(
          { 
            error: 'QUOTA_EXCEEDED',
            message: 'OpenAI quota exceeded. Using fallback analysis.',
            fallback: true
          },
          { status: 429 }
        );
      }

      if (error.status === 401) {
        return NextResponse.json(
          { 
            error: 'INVALID_API_KEY',
            message: 'OpenAI API key invalid. Using fallback analysis.',
            fallback: true
          },
          { status: 401 }
        );
      }
    }

    // For other errors, return fallback flag
    return NextResponse.json(
      { 
        error: 'AI_ANALYSIS_FAILED',
        message: 'AI analysis temporarily unavailable. Using fallback analysis.',
        fallback: true
      },
      { status: 500 }
    );
  }
}