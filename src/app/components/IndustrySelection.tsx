import { motion } from 'framer-motion';
import { industryOptions } from '../data/questions';

interface IndustrySelectionProps {
  selectedIndustries: string[];
  onChange: (industries: string[]) => void;
  title: string;
  isValid?: boolean;
}

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function IndustrySelection({ selectedIndustries, onChange, title }: IndustrySelectionProps) {
  return (
    <motion.div
      variants={fade}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4">{title}</h2>
      <p className="mb-4 text-sm sm:text-base">
        Select all industries your startup operates in: <span className="text-red-500">*</span>
      </p>
      {selectedIndustries.length === 0 && (
        <p className="text-red-500 text-sm mb-4">Please select at least one industry to continue</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {industryOptions.map((industry) => (
          <label key={industry} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="industries"
              value={industry}
              checked={selectedIndustries.includes(industry)}
              onChange={(e) => {
                const { checked, value } = e.target;
                onChange(
                  checked
                    ? [...selectedIndustries, value]
                    : selectedIndustries.filter((i) => i !== value)
                );
              }}
              className="accent-blue-700"
            />
            <span className="text-sm">{industry}</span>
          </label>
        ))}
      </div>
    </motion.div>
  );
} 