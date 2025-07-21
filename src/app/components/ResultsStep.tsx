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
      const lineHeight = 8;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      
      console.log('PDF document initialized');
      
      // Simple helper to add text
      const addText = (text: string, y: number, fontSize: number = 12, style: string = 'normal') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style as any);
        
        // Split long text to fit page width
        const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        
        return y + (splitText.length * lineHeight);
      };

      // Calculate score
      const calculateScore = () => {
        let score = 60;
        if (answers.short_description && answers.short_description.length > 50) score += 5;
        if (answers.vision && answers.vision.length > 100) score += 5;
        if (answers.market_size && answers.market_size.includes('billion')) score += 10;
        if (answers.traction && answers.traction.toLowerCase().includes('revenue')) score += 15;
        if (answers.industries && answers.industries.length > 0) score += 7;
        return Math.min(score, 100);
      };

      const score = calculateScore();
      const rating = score >= 80 ? 'High Potential' : score >= 60 ? 'Promising' : 'Needs Improvement';
      const currentDate = new Date().toLocaleDateString('en-GB');

      console.log('Score calculated:', score, 'Rating:', rating);

      // Header
      yPos = addText('MoonCro Investment Report', yPos, 20, 'bold');
      yPos += 10;
      
      yPos = addText(`Date: ${currentDate}`, yPos, 12);
      yPos = addText(`Score: ${score}/100 (${rating})`, yPos, 12);
      yPos = addText(`Industries: ${answers.industries.join(', ')}`, yPos, 12);
      yPos += 10;

      // Executive Summary
      yPos = addText('Executive Summary', yPos, 16, 'bold');
      yPos += 5;
      
      yPos = addText(`Vision: ${answers.vision || 'Not provided'}`, yPos, 12);
      yPos = addText(`Market Size: ${answers.market_size || 'Not provided'}`, yPos, 12);
      yPos = addText(`Traction: ${answers.traction || 'Not provided'}`, yPos, 12);
      yPos += 10;

      // Recommendation
      yPos = addText('Recommendation', yPos, 16, 'bold');
      yPos += 5;
      
      const recommendation = score >= 80 ? 
        'Invite to pitch - High potential startup' :
        score >= 60 ? 
        'Monitor progress - Promising but needs improvement' :
        'Decline - Significant concerns need addressing';
      
      yPos = addText(recommendation, yPos, 12);

      console.log('PDF content added successfully');

      // Save the PDF
      const fileName = `MoonCro_Investment_Report_${currentDate.replace(/\//g, '-')}.pdf`;
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

        <h3 className="text-xl font-bold mt-4">Company Summary</h3>

        <button 
          onClick={generatePDF}
          className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800 transition-colors"
        >
          Download Detailed Report
        </button>

        <hr />

        <div className="space-y-2 text-sm sm:text-base">
          <h4 className="font-semibold">Summary</h4>
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