import { Question, FormAnswers } from '../types/form';
import { motion } from 'framer-motion';

interface FormStepProps {
  questions: Question[];
  formData: FormAnswers;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  title: string;
}

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function FormStep({ questions, formData, onChange, title }: FormStepProps) {
  const renderInput = (question: Question) => {
    const getStringValue = (value: string | string[] | File | null): string => {
      if (typeof value === 'string') return value;
      if (Array.isArray(value)) return value.join(', ');
      return '';
    };

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            name={question.id}
            value={getStringValue(formData[question.id]) || ''}
            onChange={onChange}
            placeholder={question.text}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            rows={3}
          />
        );
      case 'file':
        return (
          <input
            type="file"
            name={question.id}
            onChange={onChange}
            accept=".pdf"
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        );
      default:
        return (
          <input
            type={question.type}
            name={question.id}
            value={getStringValue(formData[question.id]) || ''}
            onChange={onChange}
            placeholder={question.text}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        );
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
      <div>
        {questions.map((question) => (
          <div key={question.id} className="mb-4">
            <label className="block font-medium mb-1 text-sm sm:text-base">
              {question.number && `${question.number}. `}{question.text}
            </label>
            {renderInput(question)}
          </div>
        ))}
      </div>
    </motion.div>
  );
} 