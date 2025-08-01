import { motion } from 'framer-motion';
import { FormAnswers } from '../types/form';
import { jsPDF } from 'jspdf';
import { useState, useEffect } from 'react';

interface ResultsStepProps {
  title: string;
  answers: FormAnswers;
  onReset?: () => void;
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

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Custom Analysis Engine
const analyzeStartup = async (answers: FormAnswers): Promise<AIAnalysis> => {
  // Use your custom analysis functions instead of AI
  const marketScore = analyzeMarket(answers);
  const tractionScore = analyzeTraction(answers);
  const teamScore = analyzeTeam(answers);
  const visionScore = analyzeVision(answers);
  const businessScore = analyzeBusinessModel(answers);
  
  // Calculate weighted overall score
  const score = Math.round(
    (marketScore * 0.25) + 
    (tractionScore * 0.25) + 
    (teamScore * 0.20) + 
    (visionScore * 0.15) + 
    (businessScore * 0.15)
  );
  
  return {
    score,
    rating: score >= 80 ? 'High Potential' : score >= 60 ? 'Promising' : 'Needs Improvement',
    strengths: identifyStrengths(answers),
    weaknesses: identifyWeaknesses(answers),
    recommendations: generateRecommendations(answers, score),
    marketAnalysis: generateMarketAnalysis(answers),
    tractionAnalysis: generateTractionAnalysis(answers),
    teamAnalysis: generateTeamAnalysis(answers),
    riskFactors: assessRisks(answers),
    investmentRecommendation: generateInvestmentRecommendation(answers, score)
  };
};



const analyzeMarket = (answers: FormAnswers): number => {
  let score = 0;
  const marketSize = answers.market_size?.toLowerCase() || '';
  
  // Market size assessment
  if (marketSize.includes('billion') || marketSize.includes('$b')) score += 25;
  else if (marketSize.includes('million') || marketSize.includes('$m')) score += 15;
  else if (marketSize.length > 50) score += 10;
  else if (marketSize.length > 0) score += 5;
  
  // Market description quality
  if (marketSize.includes('tam') || marketSize.includes('addressable')) score += 10;
  if (marketSize.includes('growing') || marketSize.includes('growth')) score += 5;
  if (marketSize.includes('research') || marketSize.includes('report')) score += 5;
  
  // Pain point analysis
  const painPoint = answers.pain_point_usp?.toLowerCase() || '';
  if (painPoint.length > 100) score += 15;
  else if (painPoint.length > 50) score += 10;
  else if (painPoint.length > 0) score += 5;
  
  // USP clarity
  if (painPoint.includes('unique') || painPoint.includes('differentiat')) score += 10;
  if (painPoint.includes('competitive advantage')) score += 10;
  
  return Math.min(score, 100);
};

const analyzeTraction = (answers: FormAnswers): number => {
  let score = 0;
  const traction = answers.traction?.toLowerCase() || '';
  
  // Revenue indicators
  if (traction.includes('revenue') || traction.includes('sales')) {
    if (traction.includes('million') || traction.includes('$m')) score += 30;
    else if (traction.includes('thousand') || traction.includes('$k')) score += 20;
    else score += 15;
  }
  
  // Customer metrics
  if (traction.includes('customers') || traction.includes('users')) {
    if (traction.match(/\d+k|\d+,\d+/)) score += 20;
    else if (traction.match(/\d+/)) score += 15;
  }
  
  // Growth indicators
  if (traction.includes('growth') || traction.includes('growing')) score += 10;
  if (traction.includes('recurring') || traction.includes('subscription')) score += 15;
  if (traction.includes('pilot') || traction.includes('poc')) score += 10;
  
  // Partnerships
  if (traction.includes('partnership') || traction.includes('enterprise')) score += 15;
  
  // Length and detail
  if (traction.length > 100) score += 10;
  else if (traction.length > 50) score += 5;
  
  return Math.min(score, 100);
};

const analyzeTeam = (answers: FormAnswers): number => {
  let score = 0;
  const team = answers.team?.toLowerCase() || '';
  
  // Experience indicators
  if (team.includes('years') || team.includes('experience')) score += 15;
  if (team.includes('founded') || team.includes('entrepreneur')) score += 10;
  if (team.includes('technical') || team.includes('engineer')) score += 15;
  if (team.includes('business') || team.includes('sales')) score += 10;
  
  // Education/Background
  if (team.includes('university') || team.includes('mba') || team.includes('phd')) score += 10;
  if (team.includes('worked at') || team.includes('previously')) score += 10;
  
  // Team composition
  if (team.includes('co-founder') || team.includes('team of')) score += 15;
  if (team.includes('advisor') || team.includes('mentor')) score += 10;
  
  // Domain expertise
  if (team.includes('domain') || team.includes('industry')) score += 15;
  
  // Detail level
  if (team.length > 150) score += 15;
  else if (team.length > 100) score += 10;
  else if (team.length > 50) score += 5;
  
  return Math.min(score, 100);
};

const analyzeVision = (answers: FormAnswers): number => {
  let score = 0;
  const vision = answers.vision?.toLowerCase() || '';
  
  // Vision clarity and length
  if (vision.length > 200) score += 20;
  else if (vision.length > 100) score += 15;
  else if (vision.length > 50) score += 10;
  else if (vision.length > 0) score += 5;
  
  // Strategic thinking
  if (vision.includes('transform') || vision.includes('revolutionize')) score += 15;
  if (vision.includes('scale') || vision.includes('global')) score += 10;
  if (vision.includes('platform') || vision.includes('ecosystem')) score += 10;
  
  // Problem solving focus
  if (vision.includes('solve') || vision.includes('solution')) score += 10;
  if (vision.includes('impact') || vision.includes('change')) score += 10;
  
  // Market understanding
  if (vision.includes('market') || vision.includes('industry')) score += 5;
  if (vision.includes('customers') || vision.includes('users')) score += 5;
  
  return Math.min(score, 100);
};

const analyzeBusinessModel = (answers: FormAnswers): number => {
  let score = 0;
  
  // Funding and valuation understanding
  const askVal = answers.ask_valuation?.toLowerCase() || '';
  if (askVal.length > 50) score += 15;
  else if (askVal.length > 0) score += 5;
  
  if (askVal.includes('valuation') || askVal.includes('million')) score += 15;
  if (askVal.includes('revenue multiple') || askVal.includes('comparable')) score += 10;
  
  // Use of proceeds clarity
  const useProceeds = answers.use_of_proceeds?.toLowerCase() || '';
  if (useProceeds.length > 100) score += 15;
  else if (useProceeds.length > 50) score += 10;
  else if (useProceeds.length > 0) score += 5;
  
  if (useProceeds.includes('hire') || useProceeds.includes('team')) score += 10;
  if (useProceeds.includes('marketing') || useProceeds.includes('sales')) score += 10;
  if (useProceeds.includes('product') || useProceeds.includes('development')) score += 10;
  
  // Exit strategy
  const exit = answers.exit_potential?.toLowerCase() || '';
  if (exit.length > 50) score += 15;
  else if (exit.length > 0) score += 5;
  
  if (exit.includes('acquisition') || exit.includes('ipo')) score += 15;
  if (exit.includes('strategic') || exit.includes('buyer')) score += 10;
  
  return Math.min(score, 100);
};

const identifyStrengths = (answers: FormAnswers): string[] => {
  const strengths: string[] = [];
  
  // Market strengths
  const marketSize = answers.market_size?.toLowerCase() || '';
  if (marketSize.includes('billion')) strengths.push('Large addressable market opportunity (TAM >$1B)');
  if (marketSize.includes('growing') || marketSize.includes('growth')) strengths.push('Operating in a growing market segment');
  
  // Traction strengths
  const traction = answers.traction?.toLowerCase() || '';
  if (traction.includes('revenue')) strengths.push('Revenue-generating business with proven market demand');
  if (traction.includes('customers') && traction.match(/\d+/)) strengths.push('Established customer base with quantified metrics');
  if (traction.includes('recurring')) strengths.push('Recurring revenue model demonstrates customer retention');
  
  // Team strengths
  const team = answers.team?.toLowerCase() || '';
  if (team.includes('experience') && team.includes('years')) strengths.push('Experienced founding team with relevant industry background');
  if (team.includes('technical') && team.includes('business')) strengths.push('Balanced team with both technical and business expertise');
  if (team.includes('founded') || team.includes('entrepreneur')) strengths.push('Serial entrepreneurs with startup experience');
  
  // Vision and strategy
  const vision = answers.vision || '';
  if (vision.length > 150) strengths.push('Clear and comprehensive long-term vision');
  if (vision.toLowerCase().includes('platform') || vision.toLowerCase().includes('ecosystem')) strengths.push('Scalable platform approach with network effects potential');
  
  // Business model
  if (answers.ask_valuation && answers.ask_valuation.length > 50) strengths.push('Well-researched valuation methodology and funding strategy');
  if (answers.industries && answers.industries.length > 1) strengths.push('Multi-industry applicability reduces market concentration risk');
  
  return strengths.slice(0, 6); // Limit to top 6 strengths
};

const identifyWeaknesses = (answers: FormAnswers): string[] => {
  const weaknesses: string[] = [];
  
  // Market weaknesses
  if (!answers.market_size || answers.market_size.length < 50) {
    weaknesses.push('Insufficient market size analysis and quantification');
  }
  
  // Traction weaknesses
  const traction = answers.traction?.toLowerCase() || '';
  if (!traction.includes('revenue') && !traction.includes('customers')) {
    weaknesses.push('Limited evidence of market traction and customer validation');
  }
  if (traction.length < 50) {
    weaknesses.push('Lack of detailed traction metrics and growth indicators');
  }
  
  // Team weaknesses
  if (!answers.team || answers.team.length < 100) {
    weaknesses.push('Incomplete team information and experience backgrounds');
  }
  
  // Vision weaknesses
  if (!answers.vision || answers.vision.length < 100) {
    weaknesses.push('Underdeveloped strategic vision and market approach');
  }
  
  // Business model weaknesses
  if (!answers.ask_valuation || answers.ask_valuation.length < 30) {
    weaknesses.push('Unclear funding requirements and valuation justification');
  }
  if (!answers.use_of_proceeds || answers.use_of_proceeds.length < 50) {
    weaknesses.push('Vague use of proceeds and capital allocation strategy');
  }
  
  // Industry focus
  if (!answers.industries || answers.industries.length === 0) {
    weaknesses.push('Lack of clear industry focus and target market definition');
  }
  
  return weaknesses.slice(0, 5); // Limit to top 5 weaknesses
};

const generateRecommendations = (answers: FormAnswers, score: number): string[] => {
  const recommendations: string[] = [];
  
  if (score >= 80) {
    recommendations.push('Proceed with comprehensive due diligence and financial modeling');
    recommendations.push('Schedule management presentation and customer reference calls');
    recommendations.push('Engage technical advisors for product and technology assessment');
    recommendations.push('Prepare term sheet with standard venture capital terms');
  } else if (score >= 60) {
    recommendations.push('Request additional documentation addressing identified gaps');
    recommendations.push('Schedule follow-up meeting with expanded market analysis');
    recommendations.push('Consider pilot investment or convertible note structure');
    recommendations.push('Provide specific feedback on business plan improvements');
  } else {
    recommendations.push('Comprehensive business plan revision required before investment consideration');
    recommendations.push('Recommend participation in accelerator or incubator program');
    recommendations.push('Suggest engagement with industry mentors and advisors');
    recommendations.push('Focus on customer development and market validation');
  }
  
  // Specific recommendations based on weaknesses
  if (!answers.traction || answers.traction.length < 50) {
    recommendations.push('Develop detailed traction metrics and customer case studies');
  }
  if (!answers.market_size || answers.market_size.length < 50) {
    recommendations.push('Conduct thorough market research with TAM/SAM/SOM analysis');
  }
  
  return recommendations.slice(0, 6);
};

const assessRisks = (answers: FormAnswers): string[] => {
  const risks: string[] = [];
  
  // Market risks
  if (!answers.market_size || !answers.market_size.toLowerCase().includes('billion')) {
    risks.push('Limited market size may constrain scalability and returns');
  }
  
  // Execution risks
  if (!answers.team || answers.team.length < 100) {
    risks.push('Incomplete team may lack capabilities for successful execution');
  }
  
  // Traction risks
  const traction = answers.traction?.toLowerCase() || '';
  if (!traction.includes('revenue') && !traction.includes('customers')) {
    risks.push('Lack of market validation increases product-market fit risk');
  }
  
  // Financial risks
  if (!answers.ask_valuation || answers.ask_valuation.length < 30) {
    risks.push('Unclear funding strategy may indicate poor financial planning');
  }
  
  // Competitive risks
  if (!answers.pain_point_usp || answers.pain_point_usp.length < 50) {
    risks.push('Weak differentiation may lead to competitive disadvantage');
  }
  
  return risks.slice(0, 4);
};

const generateMarketAnalysis = (answers: FormAnswers): string => {
  const marketSize = answers.market_size || '';
  
  if (marketSize.toLowerCase().includes('billion')) {
    return 'Strong market opportunity with large addressable market. The startup operates in a substantial market with significant growth potential.';
  } else if (marketSize.toLowerCase().includes('million')) {
    return 'Moderate market opportunity. While the market size is meaningful, scalability may be limited compared to billion-dollar markets.';
  } else {
    return 'Market opportunity requires further validation. More detailed market research and sizing analysis needed to assess true potential.';
  }
};

const generateTractionAnalysis = (answers: FormAnswers): string => {
  const traction = answers.traction?.toLowerCase() || '';
  
  if (traction.includes('revenue')) {
    return 'Strong traction demonstrated through revenue generation. This indicates product-market fit and customer willingness to pay.';
  } else if (traction.includes('customers') || traction.includes('users')) {
    return 'Good customer acquisition progress. Focus should be on monetization and revenue generation strategies.';
  } else {
    return 'Limited traction evidence. Startup needs to focus on customer development and market validation.';
  }
};

const generateTeamAnalysis = (answers: FormAnswers): string => {
  const team = answers.team?.toLowerCase() || '';
  
  if (team.includes('experience') && team.includes('technical') && team.includes('business')) {
    return 'Well-rounded team with complementary skills and relevant experience. Strong foundation for execution.';
  } else if (team.includes('experience') || team.includes('founded')) {
    return 'Experienced team with some relevant background. May benefit from additional expertise in key areas.';
  } else {
    return 'Team composition and experience require further evaluation. Consider adding advisors or key hires.';
  }
};

const generateInvestmentRecommendation = (answers: FormAnswers, score: number): string => {
  if (score >= 80) {
    return 'STRONG RECOMMENDATION: High-potential investment opportunity with solid fundamentals. Proceed with term sheet preparation.';
  } else if (score >= 60) {
    return 'CONDITIONAL RECOMMENDATION: Promising opportunity requiring additional due diligence and gap addressing.';
  } else {
    return 'NOT RECOMMENDED: Significant development needed before investment readiness. Maintain for future monitoring.';
  }
};

export function ResultsStep({ title, answers, onReset }: ResultsStepProps) {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performAnalysis = async () => {
      setIsLoading(true);
      const analysis = await analyzeStartup(answers);
      setAiAnalysis(analysis);
      setIsLoading(false);
    };

    performAnalysis();
  }, [answers]);


  const score = aiAnalysis?.score || 0;
  const rating = aiAnalysis?.rating || 'Analyzing...';
  const ratingColor = score >= 80 ? 'bg-green-100 text-green-800' : score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';

  const generatePDFFile = () => {
    try {
      console.log('Starting PDF generation...');
      console.log('Answers received:', answers);
      
      const doc = new jsPDF();
      let yPos = 20;
      const lineHeight = 6;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      console.log('PDF document initialized');
      
      // Helper function to check if we need a new page
      const checkNewPage = (currentY: number, spaceNeeded: number = 20) => {
        if (currentY + spaceNeeded > pageHeight - 30) {
          doc.addPage();
          return 20;
        }
        return currentY;
      };
      
      // Helper to add text with word wrapping
      const addText = (text: string, y: number, fontSize: number = 10, style: 'normal' | 'bold' | 'italic' | 'bolditalic' = 'normal', indent: number = 0) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style);
        
        const maxWidth = pageWidth - 2 * margin - indent;
        const splitText = doc.splitTextToSize(text, maxWidth);
        
        y = checkNewPage(y, splitText.length * lineHeight);
        doc.text(splitText, margin + indent, y);
        
        return y + (splitText.length * lineHeight);
      };

      // Helper to add bullet point
      const addBullet = (text: string, y: number, fontSize: number = 10) => {
        y = checkNewPage(y);
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'normal');
        
        // Add bullet
        doc.text('•', margin + 5, y);
        
        // Add text with proper wrapping
        const maxWidth = pageWidth - 2 * margin - 20;
        const splitText = doc.splitTextToSize(text, maxWidth);
        doc.text(splitText, margin + 15, y);
        
        return y + (splitText.length * lineHeight);
      };
      const currentDate = new Date().toLocaleDateString('en-GB');
      const timestamp = new Date().toLocaleString();

      console.log('Score calculated:', score, 'Rating:', rating);

      // === ENHANCED PDF GENERATION ===
      
      // Main Header with MoonCro branding
      yPos = addText('MoonCro Investment Analysis Report', yPos, 10, 'bold');
      yPos += 8;
      
      // Startup details
      const startupName = answers.startup_name || '[Startup Name]';
      yPos = addText(`Startup Name: ${startupName}`, yPos, 14, 'bold');
      yPos = addText(`Analysis Date: ${currentDate}`, yPos, 12);
      yPos = addText(`Industry Focus: ${answers.industries.length > 0 ? answers.industries.join(', ') : 'Not specified'}`, yPos, 12);
      
      // Score badge
      // yPos += 5;
      // doc.setFillColor(score >= 80 ? 34 : score >= 60 ? 255 : 220, score >= 80 ? 197 : score >= 60 ? 193 : 53, score >= 80 ? 94 : score >= 60 ? 7 : 69);
      // doc.roundedRect(margin, yPos - 3, 60, 12, 3, 3, 'F');
      // doc.setTextColor(255, 255, 255);
      // yPos = addText(`SCORE: ${score}/100`, yPos, 12, 'bold');
      // doc.setTextColor(0, 0, 0);
      // yPos += 3;
      // yPos = addText(`Rating: ${rating}`, yPos, 12, 'bold');
      // Score badge - Professional design
      yPos += 8;
      
      // Create a more sophisticated score display
      const badgeWidth = 180;
      const badgeHeight = 35;
      const badgeX = margin;
      const badgeY = yPos;
      
      // Gradient effect simulation with multiple rectangles
      if (score >= 80) {
        // Green gradient for high scores
        doc.setFillColor(240, 253, 244); // Light green background
        doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 4, 4, 'F');
        doc.setDrawColor(34, 197, 94); // Green border
        doc.setLineWidth(0.5);
        doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 4, 4, 'S');
        
        // Score section with darker green
        doc.setFillColor(34, 197, 94);
        doc.roundedRect(badgeX, badgeY, 65, badgeHeight, 4, 4, 'F');
        
        // Add score text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${score}/100`, badgeX + 32, badgeY + 22, { align: 'center' });
        
        // Rating text
        doc.setTextColor(34, 197, 94);
        doc.setFontSize(14);
        doc.text(rating.toUpperCase(), badgeX + 120, badgeY + 22, { align: 'center' });
        
      } else if (score >= 60) {
        // Yellow gradient for medium scores
        doc.setFillColor(254, 252, 232); // Light yellow background
        doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 4, 4, 'F');
        doc.setDrawColor(250, 204, 21); // Yellow border
        doc.setLineWidth(0.5);
        doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 4, 4, 'S');
        
        // Score section with darker yellow
        doc.setFillColor(250, 204, 21);
        doc.roundedRect(badgeX, badgeY, 65, badgeHeight, 4, 4, 'F');
        
        // Add score text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${score}/100`, badgeX + 32, badgeY + 22, { align: 'center' });
        
        // Rating text
        doc.setTextColor(161, 98, 7);
        doc.setFontSize(14);
        doc.text(rating.toUpperCase(), badgeX + 120, badgeY + 22, { align: 'center' });
        
      } else {
        // Red gradient for low scores
        doc.setFillColor(254, 242, 242); // Light red background
        doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 4, 4, 'F');
        doc.setDrawColor(239, 68, 68); // Red border
        doc.setLineWidth(0.5);
        doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 4, 4, 'S');
        
        // Score section with darker red
        doc.setFillColor(239, 68, 68);
        doc.roundedRect(badgeX, badgeY, 65, badgeHeight, 4, 4, 'F');
        
        // Add score text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${score}/100`, badgeX + 32, badgeY + 22, { align: 'center' });
        
        // Rating text
        doc.setTextColor(185, 28, 28);
        doc.setFontSize(14);
        doc.text(rating.toUpperCase(), badgeX + 120, badgeY + 22, { align: 'center' });
      }
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      yPos = badgeY + badgeHeight + 5;
      
      yPos += 10;
      yPos = addText('Powered by MoonCro Assessment Platform', yPos, 10, 'italic');
      yPos += 15;

      // 1. Executive Summary & Recommendation
      yPos = addText('1. EXECUTIVE SUMMARY & INVESTMENT RECOMMENDATION', yPos, 16, 'bold');
      yPos += 8;
      
      // Company Overview
      yPos = addText('Company Overview:', yPos, 12, 'bold');
      yPos += 2;
      yPos = addBullet(`Business: ${answers.short_description || 'Not provided'}`, yPos);
      yPos = addBullet(`Vision: ${answers.vision ? answers.vision.substring(0, 200) + (answers.vision.length > 200 ? '...' : '') : 'Not provided'}`, yPos);
      yPos = addBullet(`Market: ${answers.market_size ? answers.market_size.substring(0, 150) + (answers.market_size.length > 150 ? '...' : '') : 'Not provided'}`, yPos);
      yPos += 5;

      // Strengths Analysis
      yPos = addText('Key Strengths Identified:', yPos, 12, 'bold');
      yPos += 2;
      
      const strengths = [];
      if (answers.vision && answers.vision.length > 100) strengths.push('Well-articulated strategic vision and market approach');
      if (answers.market_size && answers.market_size.toLowerCase().includes('billion')) strengths.push('Large total addressable market (TAM) identified');
      if (answers.traction && answers.traction.toLowerCase().includes('revenue')) strengths.push('Revenue generation and customer traction demonstrated');
      if (answers.team && answers.team.length > 100) strengths.push('Detailed team composition and capability overview');
      if (answers.industries && answers.industries.length > 1) strengths.push('Cross-industry applicability and market diversification');
      if (answers.ask_valuation && answers.ask_valuation.length > 50) strengths.push('Clear funding requirements and valuation framework');
      
      if (strengths.length === 0) strengths.push('Foundational business concept established with room for development');
      
      for (const strength of strengths.slice(0, 5)) {
        yPos = addBullet(strength, yPos);
      }
      yPos += 5;

      // Investment Recommendation
      yPos = addText('Investment Recommendation:', yPos, 12, 'bold');
      yPos += 2;
      
      const recommendation = score >= 80 ? 
        '✅ RECOMMEND FOR INVESTMENT: High-potential startup demonstrating strong fundamentals across key evaluation criteria. Proceed with due diligence and term sheet preparation.' :
        score >= 60 ? 
        '⚠️ CONDITIONAL INTEREST: Promising opportunity with solid foundation but requires addressing specific gaps before investment decision. Schedule follow-up meeting and request additional documentation.' :
        '❌ PASS AT THIS TIME: Significant development needed across multiple areas before investment readiness. Maintain relationship for future monitoring and re-evaluation in 6-12 months.';
      
      yPos = addBullet(recommendation, yPos, 8);
      yPos += 10;

      // 2. Detailed Analysis Breakdown
      yPos = checkNewPage(yPos, 40);
      yPos = addText('2. DETAILED ANALYSIS BREAKDOWN', yPos, 16, 'bold');
      yPos += 8;

      // Market Analysis
      yPos = addText('Market Opportunity Analysis:', yPos, 14, 'bold');
      yPos += 3;
      yPos = addText(`Market Size Assessment: ${answers.market_size || 'Not provided'}`, yPos, 10);
      yPos += 3;
      const marketScore = answers.market_size && answers.market_size.toLowerCase().includes('billion') ? 'Strong' : 
                         answers.market_size && answers.market_size.length > 50 ? 'Moderate' : 'Weak';
      yPos = addText(`Assessment: ${marketScore} - ${marketScore === 'Strong' ? 'Large addressable market with quantified opportunity' : 
                     marketScore === 'Moderate' ? 'Market opportunity identified but needs more specificity' : 
                     'Market analysis lacks detail and quantification'}`, yPos, 10, 'italic');
      yPos += 8;

      // Traction Analysis  
      yPos = addText('Traction & Business Model:', yPos, 14, 'bold');
      yPos += 3;
      yPos = addText(`Current Status: ${answers.traction || 'Not provided'}`, yPos, 10);
      yPos += 3;
      const tractionScore = answers.traction && answers.traction.toLowerCase().includes('revenue') ? 'Strong' : 
                           answers.traction && answers.traction.length > 50 ? 'Moderate' : 'Weak';
      yPos = addText(`Assessment: ${tractionScore} - ${tractionScore === 'Strong' ? 'Revenue-generating with clear business model' : 
                     tractionScore === 'Moderate' ? 'Some progress demonstrated but needs quantification' : 
                     'Limited evidence of market validation and traction'}`, yPos, 10, 'italic');
      yPos += 8;

      // Team Analysis
      yPos = addText('Team & Execution Capability:', yPos, 14, 'bold');
      yPos += 3;
      yPos = addText(`Team Overview: ${answers.team ? answers.team.substring(0, 200) + (answers.team.length > 200 ? '...' : '') : 'Not provided'}`, yPos, 10);
      yPos += 3;
      const teamScore = answers.team && answers.team.length > 100 ? 'Strong' : 
                       answers.team && answers.team.length > 50 ? 'Moderate' : 'Weak';
      yPos = addText(`Assessment: ${teamScore} - ${teamScore === 'Strong' ? 'Comprehensive team overview with clear roles and experience' : 
                     teamScore === 'Moderate' ? 'Basic team information provided' : 
                     'Team composition and experience needs more detail'}`, yPos, 10, 'italic');

      // Continue with more sections...
      doc.addPage();
      yPos = 20;

      // 3. Risk Assessment & Red Flags
      yPos = addText('3. RISK ASSESSMENT & RED FLAGS', yPos, 16, 'bold');
      yPos += 8;

      yPos = addText('Identified Risk Factors:', yPos, 12, 'bold');
      yPos += 2;
      
      const redFlags = [];
      if (!answers.traction || answers.traction.length < 50) redFlags.push('Limited quantified traction metrics and customer validation data');
      if (!answers.market_size || answers.market_size.length < 50) redFlags.push('Insufficient market size analysis and competitive landscape assessment');
      if (!answers.team || answers.team.length < 50) redFlags.push('Incomplete team information and experience backgrounds');
      if (!answers.ask_valuation || answers.ask_valuation.length < 30) {
        redFlags.push('Unclear funding requirements and valuation methodology');
      }
      if (!answers.industries || answers.industries.length < 2) redFlags.push('Limited industry diversification and market applicability');
      if (!answers.short_description || answers.short_description.length < 50) redFlags.push('Incomplete business concept and market opportunity description');
      if (!answers.vision || answers.vision.length < 100) redFlags.push('Lack of clear strategic vision and market approach');
      
      if (redFlags.length === 0) redFlags.push('No significant red flags identified - comprehensive information provided');
      
      for (const flag of redFlags.slice(0, 7)) {
        yPos = addBullet(flag, yPos);
      }
      yPos += 10;

      // 4. Next Steps & Recommendations
      yPos = addText('4. NEXT STEPS & RECOMMENDATIONS', yPos, 16, 'bold');
      yPos += 8;
      
      const nextSteps = score >= 80 ? [
        'Schedule comprehensive due diligence session',
        'Request detailed financial projections and unit economics',
        'Conduct customer reference calls and market validation',
        'Prepare term sheet for potential investment',
        'Engage technical advisor for product/technology review'
      ] : score >= 60 ? [
        'Request additional documentation addressing identified gaps',
        'Schedule follow-up presentation with expanded market analysis',
        'Provide feedback on business plan improvements needed',
        'Consider pilot program or smaller initial investment',
        'Re-evaluate after addressing priority concerns'
      ] : [
        'Provide comprehensive feedback on areas needing development',
        'Suggest business plan enhancement and market research',
        'Recommend accelerator program or mentorship opportunities',
        'Maintain relationship for future re-evaluation',
        'Schedule check-in meeting in 6-12 months'
      ];
      
      for (const step of nextSteps) {
        yPos = addBullet(step, yPos);
      }
      yPos += 10;

      // Footer
      yPos = addText(`Generated on ${timestamp} by MoonCro Investment Analysis Platform`, yPos, 8, 'italic');
      yPos = addText('This report is confidential and intended solely for internal investment decision-making.', yPos, 8, 'italic');

      // Save the PDF
      doc.save(`${startupName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_investment_analysis_${new Date().getTime()}.pdf`);
      console.log('PDF generated successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the console for details.');
    }
  };

  if (isLoading) {
    return (
      <motion.div
        variants={fade}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4">{title}</h2>
        <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg font-sans space-y-4">
          <div className="flex items-center justify-center space-x-2 py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-lg">Analyzing your startup...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fade}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4">{title}</h2>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg font-sans space-y-6">
        {/* Score Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Your MoonCro Score:</span>
            <span className="bg-blue-600 text-white px-3 py-1 text-sm rounded-full">{score}/100</span>
            <span className={`text-sm px-2 py-1 rounded ${ratingColor}`}>{rating}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold mt-4">{answers.startup_name || 'Company Summary'}</h3>

        {/* Investment Recommendation */}
        {aiAnalysis && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <h4 className="text-lg font-medium text-blue-900">Investment Recommendation</h4>
                <p className="mt-2 text-blue-700">{aiAnalysis.investmentRecommendation}</p>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={generatePDFFile}
          className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition-colors"
        >
          Download Detailed Analysis Report
        </button>

        <hr />

        {/* Analysis Sections */}
        {aiAnalysis && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-3">
              <h4 className="font-bold text-green-800">🎯 Key Strengths</h4>
              <ul className="space-y-2">
                {aiAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="space-y-3">
              <h4 className="font-bold text-orange-800">🔧 Areas for Improvement</h4>
              <ul className="space-y-2">
                {aiAnalysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-orange-700 flex items-start">
                    <span className="text-orange-500 mr-2">⚠</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Recommendations */}
            <div className="space-y-3">
              <h4 className="font-bold text-blue-800">💡 Recommendations</h4>
              <ul className="space-y-2">
                {aiAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="text-blue-500 mr-2">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Factors */}
            <div className="space-y-3">
              <h4 className="font-bold text-red-800">⚠️ Risk Factors</h4>
              <ul className="space-y-2">
                {aiAnalysis.riskFactors.map((risk, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start">
                    <span className="text-red-500 mr-2">!</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <hr />

        {/* Detailed Analysis */}
        {aiAnalysis && (
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800">📊 Detailed Analysis</h4>
            
            <div className="grid gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">Market Analysis</h5>
                <p className="text-sm text-gray-600">{aiAnalysis.marketAnalysis}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">Traction Analysis</h5>
                <p className="text-sm text-gray-600">{aiAnalysis.tractionAnalysis}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">Team Analysis</h5>
                <p className="text-sm text-gray-600">{aiAnalysis.teamAnalysis}</p>
              </div>
            </div>
          </div>
        )}

        <hr />

        {/* Original Summary */}
        <div className="space-y-2 text-sm sm:text-base">
          <h4 className="font-semibold">Company Summary</h4>
          <p><span className="font-semibold">Startup name:</span> {answers.startup_name || 'Not provided'}</p>
          <p><span className="font-semibold">Short description:</span> {answers.short_description}</p>
          <p><span className="font-semibold">Market size:</span> {answers.market_size}</p>
          <p><span className="font-semibold">Traction:</span> {answers.traction}</p>
          <p><span className="font-semibold">Selected industries:</span> {answers.industries.join(', ')}</p>
        </div>

        <hr />

        <div className="space-y-2">
          <div className="flex space-x-4">
            <a 
              href="mailto:hello@mooncro.com?subject=MoonCro%20AI%20Analysis%20Feedback"
              className="text-blue-700 font-medium hover:underline"
            >
              Give Feedback on Analysis
            </a>
            {onReset && (
              <button 
                onClick={onReset}
                className="text-green-700 font-medium hover:underline"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}