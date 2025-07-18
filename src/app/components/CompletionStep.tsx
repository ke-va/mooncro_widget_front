import { motion } from 'framer-motion';

interface CompletionStepProps {
  onSubmit: (e: React.FormEvent) => void;
  title: string;
}

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function CompletionStep({ onSubmit, title }: CompletionStepProps) {
  return (
    <motion.div
      variants={fade}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4">{title}</h2>
      <div className="text-center">
        <div className="flex justify-center items-center mb-6">
          <div className="text-2xl mr-2">🌘</div>
          <span className="text-xl font-bold">MoonCro</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">
          Questionnaire Completed
        </h1>
        <p className="text-sm sm:text-base mb-6">
          Thank you for completing the questionnaire.
        </p>
        <button
          type="button"
          onClick={(e) => onSubmit(e as React.FormEvent)}
          className="w-full sm:w-auto px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
        >
          Submit
        </button>
      </div>
    </motion.div>
  );
} 