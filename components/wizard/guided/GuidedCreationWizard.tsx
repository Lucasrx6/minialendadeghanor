"use client";

import { useState } from "react";
import { QUESTIONS } from "@/lib/ghanor/quiz";
import type { Answer, RaceChoices, GeneratedCharacter } from "@/lib/ghanor/quiz-engine";
import { computeCharacter } from "@/lib/ghanor/quiz-engine";
import type { RaceId } from "@/lib/ghanor/types";

import { QuizWelcome } from "./QuizWelcome";
import { QuizRaceSelect } from "./QuizRaceSelect";
import { QuizQuestion } from "./QuizQuestion";
import { QuizTouches } from "./QuizTouches";
import { QuizResult } from "./QuizResult";

export type GuidedWizardStep = "welcome" | "race" | "quiz" | "touches" | "result";

export function GuidedCreationWizard() {
  const [step, setStep] = useState<GuidedWizardStep>("welcome");
  
  const [race, setRace] = useState<RaceId | null>(null);
  const [raceChoices, setRaceChoices] = useState<RaceChoices>({});
  
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [touches, setTouches] = useState({
    name: "",
    age: "",
    appearance: "",
    objective: "",
    gender: "masc" as "masc" | "fem" | "neutro"
  });

  const [computedResult, setComputedResult] = useState<GeneratedCharacter | null>(null);

  const handleStart = () => {
    setStep("race");
  };

  const handleRaceSelect = (selectedRace: RaceId, choices: RaceChoices) => {
    setRace(selectedRace);
    setRaceChoices(choices);
    setStep("quiz");
  };

  const handleAnswer = (optionId: "a" | "b" | "c" | "d" | "skip") => {
    if (optionId !== "skip") {
      const newAnswers = [...answers];
      const qId = QUESTIONS[currentQuestionIndex].id;
      const existingIdx = newAnswers.findIndex(a => a.questionId === qId);
      if (existingIdx >= 0) {
        newAnswers[existingIdx] = { questionId: qId, optionId };
      } else {
        newAnswers.push({ questionId: qId, optionId });
      }
      setAnswers(newAnswers);
    }
    
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStep("touches");
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStep("race");
    }
  };

  const handleTouchesSubmit = (data: typeof touches) => {
    setTouches(data);
    
    // Compute character here
    const char = computeCharacter(answers, race!, raceChoices, data.gender);
    setComputedResult(char);
    
    setStep("result");
  };

  const handleRestart = () => {
    setStep("welcome");
    setRace(null);
    setRaceChoices({});
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setComputedResult(null);
  };

  return (
    <div className="w-full">
      {step === "welcome" && (
        <QuizWelcome onStart={handleStart} />
      )}
      
      {step === "race" && (
        <QuizRaceSelect 
          initialRace={race} 
          initialChoices={raceChoices} 
          onNext={handleRaceSelect} 
        />
      )}
      
      {step === "quiz" && (
        <QuizQuestion 
          question={QUESTIONS[currentQuestionIndex]}
          total={QUESTIONS.length}
          index={currentQuestionIndex}
          onAnswer={handleAnswer}
          onBack={handlePrevQuestion}
        />
      )}
      
      {step === "touches" && (
        <QuizTouches 
          race={race!}
          initialTouches={touches}
          onSubmit={handleTouchesSubmit}
          onBack={() => { setStep("quiz"); setCurrentQuestionIndex(QUESTIONS.length - 1); }}
        />
      )}
      
      {step === "result" && computedResult && (
        <QuizResult 
          computed={computedResult}
          touches={touches}
          answers={answers}
          race={race!}
          raceChoices={raceChoices}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
