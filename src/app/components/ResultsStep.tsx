import { motion } from 'framer-motion';
import { FormAnswers } from '../types/form';

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

        <button className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800">
          Download Report
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