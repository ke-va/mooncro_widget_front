// src/app/page.tsx - Updated to use ResultsStep
"use client";
import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { FormStep } from "./components/FormStep";
import { IndustrySelection } from "./components/IndustrySelection";
import { CompletionStep } from "./components/CompletionStep";
import { ResultsStep } from "./components/ResultsStep"; // Updated import
import { FormAnswers } from "./types/form";
import { generalQuestions } from "./data/questions";
import { getQuestionsForIndustries } from "./data/industry-questions";

export default function MoonCroMultiStepForm() {
  const [step, setStep] = useState(1);
  const [formAnswers, setFormAnswers] = useState<FormAnswers>({
    startup_name: "",
    short_description: "",
    vision: "",
    market_size: "",
    pain_point_usp: "",
    traction: "",
    team: "",
    previous_investments: "",
    ask_valuation: "",
    use_of_proceeds: "",
    exit_potential: "",
    pitch_deck: null,
    industries: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setFormAnswers(prev => ({
        ...prev,
        [name]: file
      }));
    } else {
      setFormAnswers(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleIndustriesChange = (industries: string[]) => {
    setFormAnswers(prev => ({
      ...prev,
      industries
    }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5 + formAnswers.industries.length + 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a formatted version of the answers for logging
    const formattedAnswers = {
      // General Questions
      generalAnswers: {
        'Startup Name': formAnswers.startup_name,
        'Short Description': formAnswers.short_description,
        'Vision': formAnswers.vision,
        'Market Size': formAnswers.market_size,
        'Pain Point & USP': formAnswers.pain_point_usp,
        'Traction': formAnswers.traction,
        'Team': formAnswers.team,
        'Previous Investments': formAnswers.previous_investments,
        'Ask & Valuation': formAnswers.ask_valuation,
        'Use of Proceeds': formAnswers.use_of_proceeds,
        'Exit Potential': formAnswers.exit_potential,
        'Pitch Deck': formAnswers.pitch_deck?.name || 'No file uploaded'
      },
      
      // Selected Industries
      selectedIndustries: formAnswers.industries,
      
      // Industry Specific Answers
      industryAnswers: formAnswers.industries.reduce((acc, industry) => {
        const industryQuestions = getQuestionsForIndustries([industry]);
        const industryAnswers = industryQuestions.reduce((answers, question) => {
          const answer = formAnswers[question.id];
          answers[question.text] = typeof answer === 'string' ? answer : 'Not answered';
          return answers;
        }, {} as Record<string, string>);
        
        acc[industry] = industryAnswers;
        return acc;
      }, {} as Record<string, Record<string, string>>)
    };

    console.group('🌙 MoonCro Form Submission');
    console.log('✅ General Answers:', formattedAnswers.generalAnswers);
    console.log('🏭 Selected Industries:', formattedAnswers.selectedIndustries);
    console.log('📊 Industry-Specific Answers:', formattedAnswers.industryAnswers);
    console.log('📈 Calculated Score Preview:', calculatePreviewScore());
    console.groupEnd();

    nextStep();
  };

  // Preview score calculation for development purposes
  const calculatePreviewScore = () => {
    let score = 30;
    if (formAnswers.short_description && formAnswers.short_description.length > 50) score += 8;
    if (formAnswers.vision && formAnswers.vision.length > 100) score += 12;
    if (formAnswers.market_size && formAnswers.market_size.toLowerCase().includes('billion')) score += 15;
    if (formAnswers.traction && formAnswers.traction.toLowerCase().includes('revenue')) score += 15;
    if (formAnswers.team && formAnswers.team.length > 100) score += 10;
    if (formAnswers.industries && formAnswers.industries.length > 1) score += 5;
    return Math.min(score, 100);
  };

  const getStepTitle = (currentStep: number): string => {
    if (currentStep <= 3) {
      return "General Questions";
    } else if (currentStep === 4) {
      return "Industry Selection";
    } else if (currentStep < 5 + formAnswers.industries.length) {
      const currentIndustry = formAnswers.industries[currentStep - 5];
      return `${currentIndustry} Questions`;
    } else if (currentStep === 5 + formAnswers.industries.length) {
      return "";
    } else {
      return "Analysis Results";
    }
  };

  const isCurrentStepValid = useMemo(() => {
    if (step === 4) { // Industry selection step
      return formAnswers.industries.length > 0;
    }
    return true;
  }, [step, formAnswers.industries]);

  return (
    <AnimatePresence mode="wait">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 bg-white shadow-md rounded-lg font-sans text-black relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🌘</div>
            <span className="text-lg font-bold">MoonCro</span>
          </div>
          
          {/* Progress indicator */}
          <div className="text-xs text-gray-500">
            Step {Math.min(step, 5 + formAnswers.industries.length + 1)} of {5 + formAnswers.industries.length + 1}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 && (
            <FormStep
              questions={generalQuestions.slice(0, 4)}
              formData={formAnswers}
              onChange={handleChange}
              title={getStepTitle(step)}
            />
          )}

          {step === 2 && (
            <FormStep
              questions={generalQuestions.slice(4, 7)}
              formData={formAnswers}
              onChange={handleChange}
              title={getStepTitle(step)}
            />
          )}

          {step === 3 && (
            <FormStep
              questions={generalQuestions.slice(7)}
              formData={formAnswers}
              onChange={handleChange}
              title={getStepTitle(step)}
            />
          )}

          {step === 4 && (
            <IndustrySelection
              selectedIndustries={formAnswers.industries}
              onChange={handleIndustriesChange}
              title={getStepTitle(step)}
            />
          )}

          {step >= 5 && step < 5 + formAnswers.industries.length && (
            <FormStep
              questions={getQuestionsForIndustries([formAnswers.industries[step - 5]])}
              formData={formAnswers}
              onChange={handleChange}
              title={getStepTitle(step)}
            />
          )}

          {step === 5 + formAnswers.industries.length && (
            <CompletionStep
              onSubmit={handleSubmit}
              title={getStepTitle(step)}
            />
          )}

          {step === 5 + formAnswers.industries.length + 1 && (
            <ResultsStep 
              title={getStepTitle(step)}
              answers={formAnswers}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 && step < (5 + formAnswers.industries.length) && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-300 text-sm rounded-md hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
            )}
            {step < (5 + formAnswers.industries.length) && (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isCurrentStepValid}
                className={`${step > 1 ? '' : 'ml-auto'} px-4 py-2 bg-blue-900 text-white text-sm rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                Next
              </button>
            )}
          </div>
        </form>
      </div>
    </AnimatePresence>
  );
}