
import React from 'react';
import { WORKFLOW_STEPS } from '../constants';
import { WorkflowStep } from '../types';
import { CheckIcon } from './Icon';

interface StepNavigatorProps {
  currentStep: WorkflowStep;
  completedSteps: Set<WorkflowStep>;
}

const StepNavigator: React.FC<StepNavigatorProps> = ({ currentStep, completedSteps }) => {
  const currentStepIndex = WORKFLOW_STEPS.indexOf(currentStep);

  return (
    <nav className="p-4 w-full">
      <div className="flex items-center justify-center">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = completedSteps.has(step) || index < currentStepIndex;
          const isActive = step === currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-cyan-500 border-cyan-300 shadow-lg shadow-cyan-500/50'
                      : isCompleted
                      ? 'bg-gray-700 border-cyan-500'
                      : 'bg-gray-800 border-gray-600'
                  }`}
                >
                  {isCompleted && !isActive ? <CheckIcon /> : <span>{index + 1}</span>}
                </div>
                <p className={`ml-3 font-bold ${isActive ? 'text-cyan-400' : isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
                  {step}
                </p>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className={`flex-auto border-t-2 transition-colors duration-500 mx-4 ${
                  isCompleted ? 'border-cyan-500' : 'border-gray-600'
                }`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default StepNavigator;
