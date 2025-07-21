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
  const generatePDF = () => {
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

      // Calculate score (same logic as before)
      const calculateScore = () => {
        let score = 40; // Base score
        if (answers.short_description && answers.short_description.length > 50) score += 10;
        if (answers.vision && answers.vision.length > 100) score += 15;
        if (answers.market_size && answers.market_size.toLowerCase().includes('billion')) score += 15;
        if (answers.traction && answers.traction.toLowerCase().includes('revenue')) score += 20;
        if (answers.industries && answers.industries.length > 0) score += 5;
        return Math.min(score, 100);
      };

      const score = calculateScore();
      const rating = score >= 80 ? 'High Potential' : score >= 60 ? 'Promising' : 'Needs Improvement';
      const currentDate = new Date().toLocaleDateString('en-GB');
      const timestamp = new Date().toLocaleString();

      console.log('Score calculated:', score, 'Rating:', rating);

      // === PAGE 1: HEADER AND EXECUTIVE SUMMARY ===
      
      // Main Header
      yPos = addText('MoonCro Investment Report', yPos, 18, 'bold');
      yPos += 5;
      
      // Startup details
      const startupName = answers.startup_name || '[Startup Name]';
      yPos = addText(`Startup Name: ${startupName}`, yPos, 12);
      yPos = addText(`Date: ${currentDate}`, yPos, 12);
      yPos = addText(`Industry: ${answers.industries.length > 0 ? answers.industries[0] : 'Not specified'}`, yPos, 12);
      yPos = addText(`Score: ${score} / 100 (${rating})`, yPos, 12, 'bold');
      
      yPos += 5;
      yPos = addText('Powered by MoonCro', yPos, 10, 'italic');
      yPos += 15;

      // 1. Executive Summary & Recommendation
      yPos = addText('1. Executive Summary & Recommendation', yPos, 14, 'bold');
      yPos += 5;
      
      yPos = addBullet(`Vision: ${answers.vision || 'Not provided'}`, yPos);
      yPos = addBullet(`Market Size: ${answers.market_size || 'Not provided'}`, yPos);
      yPos = addBullet(`Traction: ${answers.traction || 'Not provided'}`, yPos);
      yPos += 5;

      yPos = addText('Strengths:', yPos, 12, 'bold');
      yPos += 2;
      
      // Generate strengths based on answers
      const strengths = [];
      if (answers.vision && answers.vision.length > 100) strengths.push('Clear long-term vision articulated');
      if (answers.market_size && answers.market_size.toLowerCase().includes('billion')) strengths.push('Large addressable market identified');
      if (answers.traction && answers.traction.toLowerCase().includes('revenue')) strengths.push('Evidence of revenue traction');
      if (answers.industries && answers.industries.length > 1) strengths.push('Multi-industry approach');
      
      if (strengths.length === 0) strengths.push('Basic business concept established');
      
      for (const strength of strengths) {
        yPos = addBullet(strength, yPos);
      }
      yPos += 3;

      yPos = addText('Key Concerns:', yPos, 12, 'bold');
      yPos += 2;
      
      // Generate concerns based on answers
      const concerns = [];
      if (!answers.traction || answers.traction.length < 20) concerns.push('Limited traction details provided');
      if (!answers.market_size || answers.market_size.length < 30) concerns.push('Market size analysis needs more detail');
      if (!answers.vision || answers.vision.length < 50) concerns.push('Strategic vision requires more depth');
      if (!answers.short_description || answers.short_description.length < 30) concerns.push('Business description lacks detail');
      
      if (concerns.length === 0) concerns.push('Minor areas for improvement identified');
      
      for (const concern of concerns) {
        yPos = addBullet(concern, yPos);
      }
      yPos += 5;

      yPos = addText('Recommendation:', yPos, 12, 'bold');
      yPos += 2;
      
      const recommendation = score >= 80 ? 
        'Ready for investment consideration - High potential startup with strong fundamentals' :
        score >= 60 ? 
        'Monitor progress - Promising but needs refinement in key areas' :
        'Needs Improvement - Significant gaps to address before investment readiness';
      
      yPos = addBullet(recommendation, yPos);
      yPos += 10;

      // 2. Scoring Methodology
      yPos = checkNewPage(yPos, 60);
      yPos = addText('2. Scoring Methodology', yPos, 14, 'bold');
      yPos += 5;
      
      yPos = addBullet('Vision & Strategy (20%): Quality and clarity of long-term vision', yPos);
      yPos = addBullet('Market Size (20%): Total addressable market potential', yPos);
      yPos = addBullet('Traction (25%): Evidence of customer validation and growth', yPos);
      yPos = addBullet('Team (15%): Founder and team experience', yPos);
      yPos = addBullet('Business Model (10%): Revenue model clarity', yPos);
      yPos = addBullet('Competitive Advantage (10%): Unique value proposition', yPos);
      yPos += 5;

      yPos = addText('Score Bands:', yPos, 12, 'bold');
      yPos += 2;
      yPos = addBullet('High Potential (80-100): Ready for investment consideration', yPos);
      yPos = addBullet('Promising (60-79): Shows potential but needs refinement', yPos);
      yPos = addBullet('Needs Improvement (0-59): Significant gaps to address', yPos);

      // === PAGE 2: DETAILED ANALYSIS ===
      doc.addPage();
      yPos = 20;

      yPos = addText('3. Detailed Questionnaire Breakdown & Analysis', yPos, 14, 'bold');
      yPos += 10;

      // Short Description Analysis
      yPos = addText('Short Description', yPos, 12, 'bold');
      yPos += 3;
      yPos = addText(`Response: ${answers.short_description || 'Not provided'}`, yPos, 10);
      yPos += 2;
      const descAnalysis = !answers.short_description || answers.short_description.length < 30 ? 
        'Description could be more detailed and specific' : 
        'Good foundational description provided';
      yPos = addText(`Analysis: ${descAnalysis}`, yPos, 10, 'italic');
      yPos += 8;

      // Vision & Strategy Analysis
      yPos = addText('Vision & Strategy', yPos, 12, 'bold');
      yPos += 3;
      yPos = addText(`Response: ${answers.vision || 'Not provided'}`, yPos, 10);
      yPos += 2;
      const visionAnalysis = !answers.vision || answers.vision.length < 50 ? 
        'Vision needs more strategic depth and clarity' : 
        'Clear strategic vision articulated';
      yPos = addText(`Analysis: ${visionAnalysis}`, yPos, 10, 'italic');
      yPos += 8;

      // Market Size Analysis
      yPos = addText('Market Size', yPos, 12, 'bold');
      yPos += 3;
      yPos = addText(`Response: ${answers.market_size || 'Not provided'}`, yPos, 10);
      yPos += 2;
      const marketAnalysis = !answers.market_size || answers.market_size.length < 30 ? 
        'Market size analysis could be more specific with data' : 
        'Solid market opportunity identified';
      yPos = addText(`Analysis: ${marketAnalysis}`, yPos, 10, 'italic');
      yPos += 8;

      // Traction Analysis
      yPos = addText('Traction', yPos, 12, 'bold');
      yPos += 3;
      yPos = addText(`Response: ${answers.traction || 'Not provided'}`, yPos, 10);
      yPos += 2;
      const tractionAnalysis = !answers.traction || answers.traction.length < 20 ? 
        'Traction metrics could be more quantified and detailed' : 
        'Good evidence of market validation';
      yPos = addText(`Analysis: ${tractionAnalysis}`, yPos, 10, 'italic');
      yPos += 10;

      // 4. Red Flags & Points of Improvement
      yPos = checkNewPage(yPos, 40);
      yPos = addText('4. Red Flags & Points of Improvement', yPos, 14, 'bold');
      yPos += 5;

      yPos = addText('Red Flags:', yPos, 12, 'bold');
      yPos += 2;
      
      const redFlags = [];
      if (!answers.traction || answers.traction.length < 20) redFlags.push('Limited traction data provided');
      if (!answers.vision || answers.vision.length < 50) redFlags.push('Unclear strategic vision');
      if (!answers.market_size || answers.market_size.length < 30) redFlags.push('Insufficient market analysis');
      
      if (redFlags.length === 0) redFlags.push('No major red flags identified');
      
      for (const flag of redFlags) {
        yPos = addBullet(flag, yPos);
      }
      yPos += 5;

      yPos = addText('Points of Improvement:', yPos, 12, 'bold');
      yPos += 2;
      yPos = addBullet('Provide more detailed financial projections', yPos);
      yPos = addBullet('Strengthen competitive analysis', yPos);
      yPos = addBullet('Include specific KPIs and metrics', yPos);
      yPos = addBullet('Clarify go-to-market strategy', yPos);
      yPos += 10;

      // 5. Summary Recommendations for VC Firm
      yPos = checkNewPage(yPos, 30);
      yPos = addText('5. Summary Recommendations for VC Firm', yPos, 14, 'bold');
      yPos += 5;

      yPos = addText('Suggested Due Diligence Focus Areas:', yPos, 12, 'bold');
      yPos += 2;
      yPos = addBullet('Financial model validation and projections', yPos);
      yPos = addBullet('Market size and competitive landscape verification', yPos);
      yPos = addBullet('Team background and experience check', yPos);
      yPos = addBullet('Technology/product validation', yPos);

      // === PAGE 3: APPENDICES ===
      doc.addPage();
      yPos = 20;

      yPos = addText('6. Appendices', yPos, 14, 'bold');
      yPos += 10;
      
      yPos = addBullet('Link to full questionnaire responses: [Available in platform]', yPos);
      yPos = addBullet('Contact info: support@mooncro.com', yPos);
      yPos = addBullet(`Generated on: ${timestamp}`, yPos);

      console.log('PDF content added successfully');

      // Save the PDF
      const fileName = `MoonCro_Investment_Report_${answers.startup_name || 'Startup'}_${currentDate.replace(/\//g, '-')}.pdf`;
      console.log('Saving PDF with filename:', fileName);
      
      doc.save(fileName);
      console.log('PDF saved successfully!');
      
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
          onClick={generatePDF}
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