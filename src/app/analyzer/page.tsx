// src/app/analyzer/page.tsx
"use client";

import React, { useState } from 'react';
import { FileText, Upload, BarChart3, AlertTriangle, CheckCircle2, XCircle, Settings, Zap, DollarSign, Download } from 'lucide-react';

// Types
interface APIConfig {
  provider: 'openai' | 'claude' | 'google' | 'azure';
  apiKey: string;
  model: string;
}

interface Question {
  id: string;
  text: string;
  weight: number;
  category: string;
}

interface Response {
  questionId: string;
  answer: string;
}

interface ScoredResponse {
  questionId: string;
  question: string;
  answer: string;
  score: number;
  weight: number;
  weightedScore: number;
  feedback: string;
  category: string;
  reasoning: string;
}

interface AnalysisResult {
  responses: ScoredResponse[];
  finalScore: number;
  scoreCategory: 'Red' | 'Yellow' | 'Green';
  categorySummaries: { [key: string]: { avgScore: number; totalWeighted: number; maxWeighted: number } };
  redFlags: string[];
  executiveSummary: string;
  aiCostEstimate?: number;
  startupName?: string;
  industry?: string;
}

const MoonCroAnalyzer: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('General');
  const [responses, setResponses] = useState<Response[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAPIConfig, setShowAPIConfig] = useState(false);
  const [apiConfig, setApiConfig] = useState<APIConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini'
  });
  const [useAI, setUseAI] = useState(false);
  const [startupName, setStartupName] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // API Provider configurations
  const apiProviders = {
    openai: {
      name: 'OpenAI',
      models: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: '$0.15/$0.60 per 1M tokens' },
        { id: 'gpt-4o', name: 'GPT-4o', cost: '$2.50/$10.00 per 1M tokens' },
        { id: 'o3-mini', name: 'O3 Mini', cost: '$1.00/$4.00 per 1M tokens' }
      ],
      endpoint: 'https://api.openai.com/v1/chat/completions'
    },
    claude: {
      name: 'Anthropic Claude',
      models: [
        { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', cost: '$3.00/$15.00 per 1M tokens' },
        { id: 'claude-4-opus', name: 'Claude 4 Opus', cost: '$15.00/$75.00 per 1M tokens' },
        { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', cost: '$3.00/$15.00 per 1M tokens' }
      ],
      endpoint: 'https://api.anthropic.com/v1/messages'
    },
    google: {
      name: 'Google Gemini',
      models: [
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', cost: '$1.25/$5.00 per 1M tokens' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', cost: '$0.075/$0.30 per 1M tokens' }
      ],
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
    },
    azure: {
      name: 'Azure OpenAI',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o', cost: '$5.00/$15.00 per 1M tokens' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', cost: '$0.165/$0.66 per 1M tokens' }
      ],
      endpoint: 'https://your-resource.openai.azure.com/openai/deployments'
    }
  };

  // General Questions (always included)
  const generalQuestions: Question[] = [
    { id: 'q1', text: 'In one sentence, describe what your company does.', weight: 5, category: 'Company Overview' },
    { id: 'q2', text: 'What is your plan to succeed and differentiate your company in the market?', weight: 5, category: 'Strategy' },
    { id: 'q3', text: 'How large is the market you are targeting? Please include any relevant data or estimates.', weight: 5, category: 'Market' },
    { id: 'q4', text: 'What problem are you solving? Who are your competitors? What makes your solution unique?', weight: 5, category: 'Product' },
    { id: 'q5', text: 'Are you currently generating revenue? If yes, describe your business model, recent revenue figures, and your typical customer. If not, please share any progress or milestones.', weight: 5, category: 'Traction' },
    { id: 'q6', text: 'How many people are on your team? Where are you located? Who works full-time and part-time? Why is your team well-positioned to succeed?', weight: 5, category: 'Team' },
    { id: 'q7', text: 'Is this your first funding round? If not, describe previous investments, including amounts raised, valuations, timing, and investors.', weight: 5, category: 'Funding' },
    { id: 'q8', text: 'How much capital are you currently seeking? What valuation are you targeting? Do you have any commitments? When do you plan to close this round?', weight: 5, category: 'Funding' },
    { id: 'q9', text: 'How will you use the funds you are raising? What milestones or goals will this funding help you achieve?', weight: 5, category: 'Funding' },
    { id: 'q10', text: 'What is your expected exit strategy? Who do you think might buy your company or how will investors see a return?', weight: 5, category: 'Strategy' },
    { id: 'q11', text: 'Please upload your latest pitch deck in PDF format.', weight: 5, category: 'Documentation' }
  ];

  // Industry-specific questions
  const industries: { [key: string]: Question[] } = {
    'SaaS / B2B': [
      { id: 'saas1', text: 'What is your average Customer Acquisition Cost (CAC)?', weight: 3, category: 'Metrics' },
      { id: 'saas2', text: 'What is your churn rate (%)?', weight: 3, category: 'Metrics' },
      { id: 'saas3', text: 'What is your Monthly Recurring Revenue (MRR)?', weight: 3, category: 'Metrics' },
      { id: 'saas4', text: 'What integrations do you offer with major platforms (e.g., Salesforce, Slack)?', weight: 3, category: 'Product' },
      { id: 'saas5', text: 'What is your average contract length (in months)?', weight: 3, category: 'Metrics' }
    ],
    'Fintech': [
      { id: 'fin1', text: 'Are you regulated or licensed by any financial authority?', weight: 3, category: 'Compliance' },
      { id: 'fin2', text: 'Do you have AML and KYC procedures in place?', weight: 3, category: 'Compliance' },
      { id: 'fin3', text: 'Which banking or payment partners do you work with?', weight: 3, category: 'Partnerships' },
      { id: 'fin4', text: 'What is your total monthly transaction volume?', weight: 3, category: 'Metrics' },
      { id: 'fin5', text: 'Describe your risk management policies.', weight: 3, category: 'Risk Management' }
    ],
    'HealthTech': [
      { id: 'health1', text: 'Have you received FDA or CE certification for your product?', weight: 3, category: 'Regulatory' },
      { id: 'health2', text: 'Have you completed any clinical trials?', weight: 3, category: 'Validation' },
      { id: 'health3', text: 'How do you ensure patient data privacy and security?', weight: 3, category: 'Compliance' },
      { id: 'health4', text: 'What partnerships do you have with healthcare providers?', weight: 3, category: 'Partnerships' },
      { id: 'health5', text: 'Is your product classified as a medical device?', weight: 3, category: 'Regulatory' }
    ],
    'AI / Machine Learning': [
      { id: 'ai1', text: 'Describe the AI models or algorithms you use.', weight: 3, category: 'Technology' },
      { id: 'ai2', text: 'What data sources are used to train your AI?', weight: 3, category: 'Data' },
      { id: 'ai3', text: 'How do you address model bias and ensure validation?', weight: 3, category: 'Ethics & Quality' },
      { id: 'ai4', text: 'Do you own any proprietary datasets?', weight: 3, category: 'Data' },
      { id: 'ai5', text: 'How is your AI deployed (cloud, edge, on-premise)?', weight: 3, category: 'Technology' }
    ]
  };

  const getAllQuestions = (): Question[] => {
    const industryQuestions = industries[selectedIndustry] || [];
    return [...generalQuestions, ...industryQuestions];
  };

  const handleResponseChange = (questionId: string, answer: string) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        return prev.map(r => r.questionId === questionId ? { ...r, answer } : r);
      }
      return [...prev, { questionId, answer }];
    });
  };

  const createAIPrompt = (question: string, answer: string, category: string): string => {
    return `You are an AI startup evaluator. Score the following response to the startup question on a scale from 1 to 10 based on the MoonCro scoring criteria.

Question: "${question}"
Category: ${category}
Response: "${answer}"

Scoring Criteria:
- Score 10: Clear, detailed, and strategic response backed by data or execution
- Score 7-9: Mostly clear with minor gaps or less specificity
- Score 4-6: Vague, lacks detail, or seems generic
- Score 1-3: Unclear, missing information, or irrelevant

Please respond with a JSON object containing:
{
  "score": [number 1-10],
  "feedback": "[brief explanation of the score]",
  "reasoning": "[detailed analysis of why this score was given, considering specificity, data inclusion, strategic thinking, and execution evidence]"
}`;
  };

  const callAIAPI = async (prompt: string): Promise<{ score: number; feedback: string; reasoning: string }> => {
    if (!useAI || !apiConfig.apiKey) {
      return scoreResponseSimple(prompt);
    }

    try {
      let response: globalThis.Response;
      
      if (apiConfig.provider === 'openai') {
        response = await fetch(apiProviders.openai.endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: apiConfig.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 500
          })
        });
      } else if (apiConfig.provider === 'claude') {
        response = await fetch(apiProviders.claude.endpoint, {
          method: 'POST',
          headers: {
            'x-api-key': apiConfig.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: apiConfig.model,
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }]
          })
        });
      } else {
        throw new Error('Provider not implemented');
      }

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      let aiResponse = '';

      if (apiConfig.provider === 'openai') {
        aiResponse = data.choices[0].message.content;
      } else if (apiConfig.provider === 'claude') {
        aiResponse = data.content[0].text;
      }

      const parsed = JSON.parse(aiResponse);
      return {
        score: Math.max(1, Math.min(10, parsed.score)),
        feedback: parsed.feedback,
        reasoning: parsed.reasoning
      };

    } catch (error) {
      console.error('AI API Error:', error);
      return scoreResponseSimple(prompt);
    }
  };

  const scoreResponseSimple = (answer: string): { score: number; feedback: string; reasoning: string } => {
    const actualAnswer = answer.includes('Response: "') ? 
      answer.split('Response: "')[1].split('"')[0] : answer;

    const wordCount = actualAnswer.trim().split(/\s+/).length;
    const hasNumbers = /\d/.test(actualAnswer);
    const hasSpecifics = /\$|%|customers|users|revenue|growth|partnership|contract/i.test(actualAnswer);
    const isDetailed = wordCount >= 20;
    const isVague = /maybe|possibly|might|could|probably|hopefully/i.test(actualAnswer);
    
    let score = 5;
    let feedback = '';
    let reasoning = '';
    
    if (actualAnswer.length < 10) {
      score = 2;
      feedback = 'Response is too brief and lacks detail.';
      reasoning = 'The response contains insufficient information to properly evaluate the startup\'s capabilities or strategy.';
    } else if (isVague) {
      score = 4;
      feedback = 'Response is vague and lacks specificity.';
      reasoning = 'While the response provides some information, it relies heavily on uncertain language and lacks concrete details.';
    } else if (isDetailed && hasSpecifics && hasNumbers) {
      score = 9;
      feedback = 'Clear, detailed response with specific data and metrics.';
      reasoning = 'Excellent response demonstrating strategic thinking with concrete data points and specific examples that indicate strong execution.';
    } else if (isDetailed && hasSpecifics) {
      score = 8;
      feedback = 'Detailed response with good specificity.';
      reasoning = 'Strong response with good detail and specific information, though could benefit from more quantitative data.';
    } else if (isDetailed) {
      score = 7;
      feedback = 'Good detail but could be more specific.';
      reasoning = 'The response shows thoughtfulness and detail but lacks the specificity needed to fully assess execution capability.';
    } else if (hasSpecifics) {
      score = 6;
      feedback = 'Some specificity but lacks detail.';
      reasoning = 'Response includes relevant specifics but needs more comprehensive detail to demonstrate full understanding.';
    } else {
      score = 5;
      feedback = 'Average response with room for improvement.';
      reasoning = 'The response addresses the question but lacks both the detail and specificity expected for a strong startup evaluation.';
    }
    
    return { 
      score: Math.max(1, Math.min(10, score)), 
      feedback, 
      reasoning 
    };
  };

  const estimateAICost = (totalTokens: number): number => {
    const provider = apiProviders[apiConfig.provider];
    const model = provider.models.find(m => m.id === apiConfig.model);
    
    if (!model) return 0;
    
    const costMatch = model.cost.match(/\$(\d+\.?\d*)/);
    const costPer1M = costMatch ? parseFloat(costMatch[1]) : 1;
    
    return (totalTokens / 1000000) * costPer1M;
  };

  const analyzeResponses = async () => {
    setIsAnalyzing(true);
    
    const questions = getAllQuestions();
    const scoredResponses: ScoredResponse[] = [];
    let totalTokensUsed = 0;
    
    for (const question of questions) {
      const response = responses.find(r => r.questionId === question.id);
      if (response) {
        const prompt = createAIPrompt(question.text, response.answer, question.category);
        
        const estimatedTokens = Math.ceil((prompt.length + 200) / 3);
        totalTokensUsed += estimatedTokens;
        
        const aiResult = await callAIAPI(prompt);
        
        scoredResponses.push({
          questionId: question.id,
          question: question.text,
          answer: response.answer,
          score: aiResult.score,
          weight: question.weight,
          weightedScore: aiResult.score * question.weight,
          feedback: aiResult.feedback,
          reasoning: aiResult.reasoning,
          category: question.category
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Calculate final score
    const totalWeightedScore = scoredResponses.reduce((sum, r) => sum + r.weightedScore, 0);
    const maxPossibleScore = scoredResponses.reduce((sum, r) => sum + (10 * r.weight), 0);
    const finalScore = Math.round((totalWeightedScore / maxPossibleScore) * 100);
    
    // Determine score category
    let scoreCategory: 'Red' | 'Yellow' | 'Green';
    if (finalScore < 50) scoreCategory = 'Red';
    else if (finalScore < 75) scoreCategory = 'Yellow';
    else scoreCategory = 'Green';
    
    // Calculate category summaries
    const categorySummaries: { [key: string]: { avgScore: number; totalWeighted: number; maxWeighted: number } } = {};
    
    scoredResponses.forEach(response => {
      if (!categorySummaries[response.category]) {
        categorySummaries[response.category] = { avgScore: 0, totalWeighted: 0, maxWeighted: 0 };
      }
      categorySummaries[response.category].totalWeighted += response.weightedScore;
      categorySummaries[response.category].maxWeighted += (10 * response.weight);
    });
    
    Object.keys(categorySummaries).forEach(category => {
      const summary = categorySummaries[category];
      summary.avgScore = Math.round((summary.totalWeighted / summary.maxWeighted) * 100);
    });
    
    // Generate red flags
    const redFlags: string[] = [];
    const lowScoringResponses = scoredResponses.filter(r => r.score <= 4);
    
    if (lowScoringResponses.length > 3) {
      redFlags.push('Multiple responses lack detail and specificity');
    }
    
    const revenueQ = scoredResponses.find(r => r.questionId === 'q5');
    if (revenueQ && revenueQ.score <= 4) {
      redFlags.push('Unclear revenue model or traction metrics');
    }
    
    const teamQ = scoredResponses.find(r => r.questionId === 'q6');
    if (teamQ && teamQ.score <= 4) {
      redFlags.push('Team composition or experience concerns');
    }
    
    if (finalScore < 60) {
      redFlags.push('Overall assessment indicates high investment risk');
    }
    
    // Generate executive summary
    const executiveSummary = `This startup received a ${finalScore}/100 score (${scoreCategory} category). ${
      finalScore >= 75 ? 'The company shows strong potential with detailed responses and clear execution plans.' :
      finalScore >= 50 ? 'The company shows moderate potential but has areas that need improvement and clarification.' :
      'The company faces significant challenges and requires substantial improvements before being investment-ready.'
    } Key strengths include responses in ${Object.entries(categorySummaries).sort((a, b) => b[1].avgScore - a[1].avgScore)[0][0]}. ${
      redFlags.length > 0 ? `Primary concerns: ${redFlags.slice(0, 2).join(', ')}.` : 'No major red flags identified.'
    }`;
    
    const aiCostEstimate = useAI ? estimateAICost(totalTokensUsed) : 0;
    
    setAnalysis({
      responses: scoredResponses,
      finalScore,
      scoreCategory,
      categorySummaries,
      redFlags,
      executiveSummary,
      aiCostEstimate,
      startupName: startupName || 'Anonymous Startup',
      industry: selectedIndustry !== 'General' ? selectedIndustry : 'Technology'
    });
    
    setIsAnalyzing(false);
  };

  const generatePDFReport = async () => {
    if (!analysis) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Dynamic import of jsPDF for client-side usage
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // PDF dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 6;
      let yPos = margin;

      // Helper functions
      const checkNewPage = (currentY: number, spaceNeeded: number = 20) => {
        if (currentY + spaceNeeded > pageHeight - margin) {
          doc.addPage();
          return margin;
        }
        return currentY;
      };

      const addText = (text: string, y: number, fontSize: number = 10, style: 'normal' | 'bold' | 'italic' = 'normal', maxWidth?: number) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style);
        
        const textWidth = maxWidth || (pageWidth - 2 * margin);
        const splitText = doc.splitTextToSize(text, textWidth);
        
        y = checkNewPage(y, splitText.length * lineHeight + 5);
        doc.text(splitText, margin, y);
        
        return y + (splitText.length * lineHeight);
      };

      const addBullet = (text: string, y: number, fontSize: number = 10) => {
        y = checkNewPage(y, lineHeight + 2);
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        
        // Add bullet
        doc.text('•', margin + 5, y);
        
        // Add text with proper wrapping
        const maxWidth = pageWidth - 2 * margin - 10;
        const splitText = doc.splitTextToSize(text, maxWidth);
        doc.text(splitText, margin + 15, y);
        
        return y + (splitText.length * lineHeight);
      };

      const addSection = (title: string, y: number) => {
        y = checkNewPage(y, 15);
        
        // Add colored background for section header
        doc.setFillColor(59, 130, 246); // Blue color
        doc.rect(margin, y - 5, pageWidth - 2 * margin, 12, 'F');
        
        // Add section title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 5, y + 3);
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
        
        return y + 15;
      };

      // === GENERATE PDF CONTENT ===

      // Header with gradient effect (simulated with rectangles)
      doc.setFillColor(102, 126, 234); // Gradient start color
      doc.rect(0, 0, pageWidth, 60, 'F');
      
      // Title and company info
      doc.setTextColor(255, 255, 255);
      yPos = addText('🌙 MoonCro Startup Analysis Report', 25, 20, 'bold');
      yPos = addText(analysis.startupName || 'Startup Analysis', yPos + 5, 16, 'bold');
      
      // Date and industry
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      yPos = addText(`Date: ${currentDate}`, yPos + 5, 12);
      yPos = addText(`Industry: ${analysis.industry}`, yPos + 3, 12);
      
      // Score badge
      const scoreColor = analysis.scoreCategory === 'Green' ? [34, 197, 94] : 
                        analysis.scoreCategory === 'Yellow' ? [234, 179, 8] : [239, 68, 68];
      
      doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.roundedRect(margin, yPos, 80, 12, 3, 3, 'F');
      yPos = addText(`SCORE: ${analysis.finalScore}/100`, yPos + 8, 12, 'bold');
      
      if (useAI) {
        doc.setFillColor(139, 92, 246);
        doc.roundedRect(margin + 85, yPos - 8, 50, 12, 3, 3, 'F');
        doc.text('AI-Powered', margin + 90, yPos);
      }

      // Reset text color and continue
      doc.setTextColor(0, 0, 0);
      yPos = 80;

      // 1. Executive Summary
      yPos = addSection('1. EXECUTIVE SUMMARY & RECOMMENDATION', yPos);
      yPos += 5;
      
      yPos = addText('Overview:', yPos, 12, 'bold');
      yPos = addText(analysis.executiveSummary, yPos + 2, 10);
      yPos += 8;

      // Investment Recommendation
      yPos = addText('Investment Recommendation:', yPos, 12, 'bold');
      yPos += 2;
      
      const recommendation = analysis.finalScore >= 75 ? 
        '✅ RECOMMEND FOR INVESTMENT: High-potential startup demonstrating strong fundamentals. Proceed with due diligence.' :
        analysis.finalScore >= 50 ? 
        '⚠️ CONDITIONAL INTEREST: Promising opportunity requiring specific improvements before investment decision.' :
        '❌ PASS AT THIS TIME: Significant development needed before investment readiness.';
      
      yPos = addBullet(recommendation, yPos);
      yPos += 10;

      // 2. Category Performance Breakdown
      yPos = addSection('2. CATEGORY PERFORMANCE BREAKDOWN', yPos);
      yPos += 5;

      Object.entries(analysis.categorySummaries).forEach(([category, summary]) => {
        const categoryScore = `${category}: ${summary.avgScore}%`;
        const categoryStatus = summary.avgScore >= 75 ? ' (Excellent)' : 
                              summary.avgScore >= 50 ? ' (Good)' : ' (Needs Improvement)';
        
        yPos = addBullet(categoryScore + categoryStatus, yPos);
      });
      yPos += 10;

      // 3. Red Flags (if any)
      if (analysis.redFlags.length > 0) {
        yPos = addSection('3. KEY CONCERNS & RED FLAGS', yPos);
        yPos += 5;
        
        analysis.redFlags.forEach(flag => {
          yPos = addBullet(flag, yPos);
        });
        yPos += 10;
      }

      // 4. Detailed Question Analysis
      yPos = addSection('4. DETAILED QUESTION ANALYSIS', yPos);
      yPos += 5;

      analysis.responses.slice(0, 5).forEach((response, index) => { // Show first 5 questions
        yPos = checkNewPage(yPos, 25);
        
        yPos = addText(`Q${index + 1}: ${response.question}`, yPos, 10, 'bold');
        yPos = addText(`Score: ${response.score}/10 | Category: ${response.category}`, yPos + 2, 9);
        yPos = addText(`Response: ${response.answer.substring(0, 200)}${response.answer.length > 200 ? '...' : ''}`, yPos + 3, 9);
        yPos = addText(`Feedback: ${response.feedback}`, yPos + 3, 9, 'italic');
        
        if (useAI && response.reasoning) {
          yPos = addText(`AI Analysis: ${response.reasoning.substring(0, 150)}${response.reasoning.length > 150 ? '...' : ''}`, yPos + 3, 9, 'italic');
        }
        yPos += 8;
      });

      // 5. Next Steps & Recommendations
      yPos = addSection('5. NEXT STEPS & RECOMMENDATIONS', yPos);
      yPos += 5;

      if (analysis.finalScore >= 75) {
        yPos = addBullet('Schedule management presentation within 1-2 weeks', yPos);
        yPos = addBullet('Initiate preliminary due diligence process', yPos);
        yPos = addBullet('Prepare term sheet framework and valuation analysis', yPos);
      } else if (analysis.finalScore >= 50) {
        yPos = addBullet('Request additional documentation addressing identified gaps', yPos);
        yPos = addBullet('Schedule follow-up call within 2-3 weeks', yPos);
        yPos = addBullet('Monitor progress and re-evaluate in 3-6 months', yPos);
      } else {
        yPos = addBullet('Provide constructive feedback on improvement areas', yPos);
        yPos = addBullet('Maintain relationship for future opportunities', yPos);
        yPos = addBullet('Schedule quarterly check-ins to monitor progress', yPos);
      }
      yPos += 10;

      // Footer
      yPos = checkNewPage(yPos, 20);
      doc.setDrawColor(59, 130, 246);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;
      yPos = addText('🌙 Powered by MoonCro - Enterprise Startup Intelligence Platform', yPos, 12, 'bold');
      yPos = addText('This report contains confidential information. For internal use only.', yPos + 3, 8, 'italic');
      
      if (useAI && analysis.aiCostEstimate) {
        yPos = addText(`AI Analysis Cost: ${analysis.aiCostEstimate.toFixed(4)}`, yPos + 3, 8);
      }

      // Generate filename and save
      const fileName = `MoonCro-Analysis-${analysis.startupName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Startup'}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save the PDF
      doc.save(fileName);
      
      console.log('✅ PDF report generated successfully:', fileName);
      
    } catch (error) {
      console.error('❌ Error generating PDF report:', error);
      alert('Error generating PDF report. Please check the console for details.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 50) return 'text-red-600';
    if (score < 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreIcon = (category: 'Red' | 'Yellow' | 'Green') => {
    switch (category) {
      case 'Red': return <XCircle className="w-6 h-6 text-red-600" />;
      case 'Yellow': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'Green': return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">MoonCro Startup Analyzer</h1>
        </div>
        <p className="text-gray-600">AI-powered startup assessment tool for investors and accelerators</p>
      </div>

      {!analysis ? (
        <div className="space-y-6">
          {/* AI Configuration */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">AI-Powered Scoring</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable AI Analysis</span>
                </label>
              </div>
              <button
                onClick={() => setShowAPIConfig(!showAPIConfig)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure API
              </button>
            </div>

            {showAPIConfig && (
              <div className="grid md:grid-cols-2 gap-4 mt-4 p-4 bg-white rounded-lg border">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
                  <select
                    value={apiConfig.provider}
                    onChange={(e) => setApiConfig(prev => ({ 
                      ...prev, 
                      provider: e.target.value as APIConfig['provider'],
                      model: apiProviders[e.target.value as keyof typeof apiProviders].models[0].id
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(apiProviders).map(([key, provider]) => (
                      <option key={key} value={key}>{provider.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <select
                    value={apiConfig.model}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {apiProviders[apiConfig.provider].models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.cost}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <input
                    type="password"
                    value={apiConfig.apiKey}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter your API key..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your API key is stored locally and never sent to our servers.
                  </p>
                </div>
              </div>
            )}

            {useAI && !apiConfig.apiKey && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Configure your API key above to enable AI-powered scoring. Without it, we&apos;ll use basic rule-based scoring.
                </p>
              </div>
            )}
          </div>

          {/* Startup Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Startup Name
              </label>
              <input
                type="text"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="Enter startup name..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry Category
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="General">General Questions Only</option>
                {Object.keys(industries).map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Assessment Questions</h2>
            {getAllQuestions().map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">
                    Q{index + 1}: {question.text}
                  </h3>
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {question.category}
                    </span>
                    <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded">
                      Weight: {question.weight}
                    </span>
                  </div>
                </div>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter your response..."
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <button
              onClick={analyzeResponses}
              disabled={isAnalyzing || responses.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {useAI ? 'AI Analyzing...' : 'Analyzing...'}
                </>
              ) : (
                <>
                  {useAI ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  {useAI ? 'AI Analyze Startup' : 'Analyze Startup'}
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header with Reset */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
            <div className="flex gap-2">
              {analysis.aiCostEstimate && analysis.aiCostEstimate > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm">
                  <DollarSign className="w-4 h-4" />
                  AI Cost: ~${analysis.aiCostEstimate.toFixed(4)}
                </div>
              )}
              <button
                onClick={() => setAnalysis(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                New Analysis
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              {getScoreIcon(analysis.scoreCategory)}
              <h3 className="text-xl font-semibold">Executive Summary</h3>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.finalScore)}`}>
                {analysis.finalScore}/100
              </span>
              {useAI && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  AI-Powered
                </span>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed">{analysis.executiveSummary}</p>
          </div>

          {/* Category Scores */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analysis.categorySummaries).map(([category, summary]) => (
              <div key={category} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                <div className={`text-2xl font-bold ${getScoreColor(summary.avgScore)}`}>
                  {summary.avgScore}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      summary.avgScore >= 75 ? 'bg-green-500' :
                      summary.avgScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${summary.avgScore}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Red Flags */}
          {analysis.redFlags.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Key Concerns</h3>
              </div>
              <ul className="space-y-1">
                {analysis.redFlags.map((flag, index) => (
                  <li key={index} className="text-red-800">• {flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Scores */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Detailed Question Scores</h3>
            <div className="space-y-6">
              {analysis.responses.map((response, index) => (
                <div key={response.questionId} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900 flex-1 pr-4">
                      Q{index + 1}: {response.question}
                    </h4>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(response.score * 10)}`}>
                        {response.score}/10
                      </div>
                      <div className="text-sm text-gray-500">
                        Weight: {response.weight} | Weighted: {response.weightedScore}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Response:</p>
                    <p className="text-gray-700">{response.answer}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-blue-700 min-w-[70px]">Feedback:</span>
                      <p className="text-sm text-gray-700">{response.feedback}</p>
                    </div>
                    
                    {useAI && response.reasoning && (
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-purple-700 min-w-[70px]">AI Analysis:</span>
                        <p className="text-sm text-gray-700">{response.reasoning}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Export Results</h3>
            <div className="flex gap-2">
              <button
                onClick={generatePDFReport}
                disabled={isGeneratingPDF}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate PDF Report
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  const jsonData = {
                    timestamp: new Date().toISOString(),
                    startupName: analysis.startupName,
                    industry: analysis.industry,
                    finalScore: analysis.finalScore,
                    scoreCategory: analysis.scoreCategory,
                    executiveSummary: analysis.executiveSummary,
                    categorySummaries: analysis.categorySummaries,
                    redFlags: analysis.redFlags,
                    responses: analysis.responses,
                    aiPowered: useAI,
                    aiCost: analysis.aiCostEstimate
                  };
                  
                  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `mooncro-${analysis.startupName?.replace(/[^a-zA-Z0-9]/g, '_') || 'analysis'}-data.json`;
                  a.click();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoonCroAnalyzer;