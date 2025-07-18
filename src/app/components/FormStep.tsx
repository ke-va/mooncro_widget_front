import { Question } from '../types/form';
import { motion } from 'framer-motion';

interface FormStepProps {
  questions: Question[];
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  title: string;
}

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function FormStep({ questions, formData, onChange, title }: FormStepProps) {
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
            {question.type === 'textarea' ? (
              <textarea
                name={question.id}
                value={formData[question.id] || ''}
                onChange={onChange}
                placeholder={question.text}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                rows={3}
              />
            ) : (
              <input
                type={question.type}
                name={question.id}
                value={formData[question.id] || ''}
                onChange={onChange}
                placeholder={question.text}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
} 