"use client";
import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FormStep } from "./components/FormStep";
import { IndustrySelection } from "./components/IndustrySelection";
import { CompletionStep } from "./components/CompletionStep";
import { ResultsStep } from "./components/ResultsStep";
import { FormData } from "./types/form";
import { generalQuestions } from "./data/questions";
import { getQuestionsForIndustries } from "./data/industry-questions";

export default function MoonCroMultiStepForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
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
    pitch_deck: "",
    industries: [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIndustriesChange = (industries: string[]) => {
    setFormData({ ...formData, industries });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5 + formData.industries.length + 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
    console.log("Submitted:", formData);
  };

  const getStepTitle = (currentStep: number): string => {
    if (currentStep <= 3) {
      return "General Questions";
    } else if (currentStep === 4) {
      return "Industry Selection";
    } else if (currentStep < 5 + formData.industries.length) {
      const currentIndustry = formData.industries[currentStep - 5];
      return `${currentIndustry} Questions`;
    } else if (currentStep === 5 + formData.industries.length) {
      return "Submission";
    } else {
      return "Results";
    }
  };

  return (
    <AnimatePresence mode="wait">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 bg-white shadow-md rounded-lg font-sans text-black relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🌘</div>
            <span className="text-lg font-bold">MoonCro</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 && (
            <FormStep
              questions={generalQuestions.slice(0, 4)}
              formData={formData}
              onChange={handleChange}
              title={getStepTitle(step)}
            />
          )}

          {step === 2 && (
            <FormStep
              questions={generalQuestions.slice(4, 7)}
              formData={formData}
              onChange={handleChange}
              title={getStepTitle(step)}
            />
          )}

          {step === 3 && (
            <FormStep
              questions={generalQuestions.slice(7)}
              formData={formData}
              onChange={handleChange}
              title={getStepTitle(step)}
            />
          )}

          {step === 4 && (
            <IndustrySelection
              selectedIndustries={formData.industries}
              onChange={handleIndustriesChange}
              title={getStepTitle(step)}
            />
          )}

          {step >= 5 && step < 5 + formData.industries.length && (
            <FormStep
              questions={getQuestionsForIndustries([formData.industries[step - 5]])}
              formData={formData}
              onChange={handleChange}
              title={getStepTitle(step)}
            />
          )}

          {step === 5 + formData.industries.length && (
            <CompletionStep
              onSubmit={handleSubmit}
              title={getStepTitle(step)}
            />
          )}

          {step === 5 + formData.industries.length + 1 && (
            <ResultsStep title={getStepTitle(step)} />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 && step < (5 + formData.industries.length) && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-300 text-sm rounded-md hover:bg-gray-400"
              >
                Back
              </button>
            )}
            {step < (5 + formData.industries.length) && (
              <button
                type="button"
                onClick={nextStep}
                className={`${step > 1 ? '' : 'ml-auto'} px-4 py-2 bg-blue-900 text-white text-sm rounded-md hover:bg-blue-800`}
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
