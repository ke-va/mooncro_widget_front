import { motion } from 'framer-motion';
import { FormAnswers } from '../types/form';
import { jsPDF } from 'jspdf';

interface ResultsStepProps {
  title: string;
  answers: FormAnswers;
}

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function ResultsStep({ title, answers }: ResultsStepProps) {
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
      const addText = (text: string, y: number, fontSize: number = 10, style: string = 'normal', indent: number = 0) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style as any);
        
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
        const maxWidth = pageWidth - 2 * margin - 15;
        const splitText = doc.splitTextToSize(text, maxWidth);
        doc.text(splitText, margin + 15, y);
        
        return y + (splitText.length * lineHeight);
      };

      // Calculate score (enhanced logic)
      const calculateScore = () => {
        let score = 30; // Base score
        
        // Short description scoring
        if (answers.short_description && answers.short_description.length > 50) score += 8;
        else if (answers.short_description && answers.short_description.length > 20) score += 5;
        
        // Vision scoring
        if (answers.vision && answers.vision.length > 100) score += 12;
        else if (answers.vision && answers.vision.length > 50) score += 8;
        
        // Market size scoring
        if (answers.market_size) {
          if (answers.market_size.toLowerCase().includes('billion')) score += 15;
          else if (answers.market_size.toLowerCase().includes('million')) score += 10;
          else if (answers.market_size.length > 50) score += 8;
        }
        
        // Traction scoring
        if (answers.traction) {
          if (answers.traction.toLowerCase().includes('revenue')) score += 15;
          else if (answers.traction.toLowerCase().includes('customers')) score += 10;
          else if (answers.traction.length > 50) score += 8;
        }
        
        // Team scoring
        if (answers.team && answers.team.length > 100) score += 10;
        
        // Industry diversity bonus
        if (answers.industries && answers.industries.length > 1) score += 5;
        
        return Math.min(score, 100);
      };

      const score = calculateScore();
      const rating = score >= 80 ? 'High Potential' : score >= 60 ? 'Promising' : 'Needs Improvement';
      const currentDate = new Date().toLocaleDateString('en-GB');
      const timestamp = new Date().toLocaleString();

      console.log('Score calculated:', score, 'Rating:', rating);

      // === ENHANCED PDF GENERATION ===
      
      // Main Header with MoonCro branding
      yPos = addText('MoonCro Investment Analysis Report', yPos, 2, 'bold');
      yPos += 8;
      
      // Startup details
      const startupName = answers.startup_name || '[Startup Name]';
      yPos = addText(`Startup Name: ${startupName}`, yPos, 14, 'bold');
      yPos = addText(`Analysis Date: ${currentDate}`, yPos, 12);
      yPos = addText(`Industry Focus: ${answers.industries.length > 0 ? answers.industries.join(', ') : 'Not specified'}`, yPos, 12);
      
      // Score badge
      yPos += 5;
      doc.setFillColor(score >= 80 ? 34 : score >= 60 ? 255 : 220, score >= 80 ? 197 : score >= 60 ? 193 : 53, score >= 80 ? 94 : score >= 60 ? 7 : 69);
      doc.roundedRect(margin, yPos - 3, 60, 12, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      yPos = addText(`SCORE: ${score}/100`, yPos, 12, 'bold');
      doc.setTextColor(0, 0, 0);
      yPos += 3;
      yPos = addText(`Rating: ${rating}`, yPos, 12, 'bold');
      
      yPos += 10;
      yPos = addText('Powered by MoonCro AI Assessment Platform', yPos, 10, 'italic');
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
      
      yPos = addBullet(recommendation, yPos);
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
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Your MoonCro score:</span>
            <span className="bg-blue-600 text-white px-3 py-1 text-sm rounded-full">82/100</span>
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">High Potential</span>
          </div>
        </div>

        <h3 className="text-xl font-bold mt-4">{answers.startup_name || 'Company Summary'}</h3>

        <button 
          onClick={generatePDFFile}
          className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition-colors"
        >
          Download Detailed Report
        </button>

        <hr />

        <div className="space-y-2 text-sm sm:text-base">
          <h4 className="font-semibold">Summary</h4>
          <p><span className="font-semibold">Startup name:</span> {answers.startup_name || 'Not provided'}</p>
          <p><span className="font-semibold">Short description:</span> {answers.short_description}</p>
          <p><span className="font-semibold">Market size:</span> {answers.market_size}</p>
          <p><span className="font-semibold">Traction:</span> {answers.traction}</p>
          <p><span className="font-semibold">Selected industries:</span> {answers.industries.join(', ')}</p>
        </div>

        <hr />

        <div className="space-y-2">
          <button className="text-blue-700 font-medium hover:underline">View All Responses</button>
          <button className="text-blue-700 font-medium hover:underline">Give Feedback</button>
        </div>
      </div>
    </motion.div>
  );
}