import { WorkflowStep, AspectRatio } from './types';
import { MobileIcon, SquareIcon, LandscapeIcon, PortraitIcon, PresentationIcon } from './components/Icon';
import React from 'react';

export const WORKFLOW_STEPS: WorkflowStep[] = [
  WorkflowStep.Upload,
  WorkflowStep.Ratio,
  WorkflowStep.Concept,
  WorkflowStep.Edit,
  WorkflowStep.Download,
];

export const ASPECT_RATIOS: AspectRatio[] = [
  // FIX: Replaced JSX syntax with React.createElement as JSX is not supported in .ts files by default.
  { name: '9:16', value: '9:16', icon: React.createElement(MobileIcon) },
  // FIX: Replaced JSX syntax with React.createElement as JSX is not supported in .ts files by default.
  { name: '1:1', value: '1:1', icon: React.createElement(SquareIcon) },
  // FIX: Replaced JSX syntax with React.createElement as JSX is not supported in .ts files by default.
  { name: '16:9', value: '16:9', icon: React.createElement(LandscapeIcon) },
  // FIX: Replaced JSX syntax with React.createElement as JSX is not supported in .ts files by default.
  { name: '3:4', value: '3:4', icon: React.createElement(PortraitIcon) },
  // FIX: Replaced JSX syntax with React.createElement as JSX is not supported in .ts files by default.
  { name: '4:3', value: '4:3', icon: React.createElement(PresentationIcon) },
];

export const LOADING_MESSAGES = [
    "Analyzing image pixels...",
    "Removing background with nano-precision...",
    "Igniting Gemini creative engine...",
    "Crafting visual concepts...",
    "Assembling poster elements...",
    "Applying futuristic shaders...",
    "Finalizing high-impact design...",
    "Almost there, preparing the masterpiece!"
];
