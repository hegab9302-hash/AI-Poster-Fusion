
import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import { WorkflowStep, AspectRatio, GeneratedPoster } from './types';
import { WORKFLOW_STEPS, ASPECT_RATIOS } from './constants';
import { processImageFile, generatePoster, translateText } from './services/geminiService';
import StepNavigator from './components/StepNavigator';
import LoadingSpinner from './components/LoadingSpinner';
import { UploadIcon, TranslateIcon, DownloadIcon } from './components/Icon';

const App: React.FC = () => {
    const [workflowStep, setWorkflowStep] = useState<WorkflowStep>(WorkflowStep.Upload);
    const [completedSteps, setCompletedSteps] = useState<Set<WorkflowStep>>(new Set());
    
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(ASPECT_RATIOS[0]);
    const [prompt, setPrompt] = useState<string>('');
    const [generatedPosters, setGeneratedPosters] = useState<GeneratedPoster[]>([]);
    const [activePosterId, setActivePosterId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateWorkflow = (nextStep: WorkflowStep) => {
        setCompletedSteps(prev => new Set(prev).add(workflowStep));
        setWorkflowStep(nextStep);
    }

    const handleFileUpload = useCallback(async (file: File) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError("Please upload a valid image file (PNG, JPG, etc.).");
            return;
        }

        setIsLoading(true);
        setError(null);
        setLoadingMessage('Uploading and processing image...');

        try {
            const { original, noBg } = await processImageFile(file);
            setOriginalImage(original);
            setProcessedImage(noBg);
            updateWorkflow(WorkflowStep.Ratio);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred during image processing.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };
    
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleRatioSelect = (ratio: AspectRatio) => {
        setSelectedRatio(ratio);
        if (workflowStep === WorkflowStep.Ratio) {
           updateWorkflow(WorkflowStep.Concept);
        }
    };

    const handleGenerateClick = async () => {
        if (!processedImage || !prompt) {
            setError("Please provide a product image and a creative prompt.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setLoadingMessage('Generating your poster...');

        try {
            const newPosterSrc = await generatePoster(processedImage, prompt, selectedRatio.value);
            const newPoster: GeneratedPoster = { id: Date.now().toString(), src: newPosterSrc };
            setGeneratedPosters(prev => [...prev, newPoster]);
            setActivePosterId(newPoster.id);
            if(workflowStep === WorkflowStep.Concept || workflowStep === WorkflowStep.Ratio) {
                updateWorkflow(WorkflowStep.Edit);
            } else if (workflowStep === WorkflowStep.Edit){
                 updateWorkflow(WorkflowStep.Download);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred while generating the poster.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTranslate = async (targetLanguage: 'English' | 'Arabic') => {
        if (!prompt) return;
        setIsLoading(true);
        setLoadingMessage(`Translating to ${targetLanguage}...`);
        try {
            const translated = await translateText(prompt, targetLanguage);
            setPrompt(translated);
        } catch (err) {
            console.error(err);
            setError("Translation failed.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        const activePoster = generatedPosters.find(p => p.id === activePosterId);
        if (!activePoster) return;
        const link = document.createElement('a');
        link.href = activePoster.src;
        link.download = `poster-${activePosterId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const activePosterSrc = generatedPosters.find(p => p.id === activePosterId)?.src || null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-gray-200">
            <header className="flex-shrink-0 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 z-10">
                <div className="container mx-auto px-4 py-2 flex items-center justify-between">
                    <h1 className="text-2xl font-bold font-orbitron text-cyan-400 tracking-widest">
                        AI POSTER FUSION
                    </h1>
                </div>
            </header>

            <StepNavigator currentStep={workflowStep} completedSteps={completedSteps} />

            <main className="flex-grow container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Canvas Area */}
                <div className="lg:col-span-2 bg-black/50 rounded-lg shadow-2xl shadow-cyan-900/20 flex items-center justify-center p-4 relative min-h-[60vh]">
                    {isLoading && <LoadingSpinner message={loadingMessage} />}
                    {error && <div className="absolute top-4 left-4 right-4 bg-red-500/30 border border-red-500 text-red-200 p-3 rounded-md z-20">{error}</div>}
                    
                    {workflowStep === WorkflowStep.Upload && !processedImage && (
                         <div onDragOver={onDragOver} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full border-4 border-dashed border-gray-600 hover:border-cyan-400 transition-all duration-300 rounded-xl flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-cyan-300">
                            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*"/>
                            <UploadIcon />
                            <p className="mt-4 font-semibold text-lg">Drag & Drop Product Photo</p>
                            <p>or click to browse</p>
                        </div>
                    )}

                    {(processedImage) && (
                         <div className="w-full h-full flex items-center justify-center">
                            <img src={activePosterSrc || processedImage} alt="Product" className="max-w-full max-h-full object-contain"/>
                        </div>
                    )}
                </div>

                {/* Editor Panel */}
                <div className="lg:col-span-1 bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-lg p-6 flex flex-col space-y-6 overflow-y-auto">
                   {workflowStep !== WorkflowStep.Upload && processedImage && (
                    <>
                        {/* Ratio Selection */}
                        <div>
                            <h2 className="text-xl font-orbitron text-cyan-400 mb-3">2. Ratio</h2>
                            <div className="grid grid-cols-5 gap-2">
                                {ASPECT_RATIOS.map(ratio => (
                                    <button key={ratio.name} onClick={() => handleRatioSelect(ratio)}
                                        className={`p-3 flex flex-col items-center justify-center rounded-md border-2 transition-all duration-300 ${selectedRatio.name === ratio.name ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}>
                                        {ratio.icon}
                                        <span className="text-xs mt-1">{ratio.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Concept Input */}
                        <div>
                             <h2 className="text-xl font-orbitron text-cyan-400 mb-3">3. Concept</h2>
                             <div className="relative">
                                 <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., 'minimalist neon', 'summer pastel vibes', 'cyberpunk futuristic'"
                                    className="w-full h-32 p-3 bg-gray-900 border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all"
                                 />
                                 <div className="absolute bottom-2 right-2 flex space-x-2">
                                     <button onClick={() => handleTranslate('Arabic')} className="p-1.5 bg-gray-700 hover:bg-fuchsia-500 rounded-md transition-colors" title="Translate to Arabic"><TranslateIcon /></button>
                                     <button onClick={() => handleTranslate('English')} className="p-1.5 bg-gray-700 hover:bg-fuchsia-500 rounded-md transition-colors" title="Translate to English"><TranslateIcon /></button>
                                 </div>
                             </div>
                        </div>

                         {/* Generate Button */}
                        <button onClick={handleGenerateClick} disabled={isLoading || !prompt}
                            className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-bold font-orbitron rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-fuchsia-500/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                            {isLoading ? 'Generating...' : 'GENERATE POSTER'}
                        </button>

                         {generatedPosters.length > 0 && (
                            <div className="pt-4 border-t border-gray-700">
                                <h2 className="text-xl font-orbitron text-cyan-400 mb-3">4. Download</h2>
                                <button onClick={handleDownload} disabled={!activePosterId}
                                className="w-full flex items-center justify-center py-3 px-6 bg-gray-700 text-gray-200 font-bold rounded-lg hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <DownloadIcon />
                                    Download Active Poster
                                </button>
                            </div>
                        )}
                    </>
                   )}
                   {workflowStep === WorkflowStep.Upload && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                         <h2 className="text-xl font-orbitron text-cyan-400 mb-3">1. Upload Image</h2>
                         <p>Start by uploading a product photo to begin the creative process.</p>
                     </div>
                   )}
                </div>
            </main>

            {/* Poster Collection Panel */}
            {generatedPosters.length > 0 && (
                <footer className="flex-shrink-0 bg-black/30 backdrop-blur-sm mt-8">
                    <div className="container mx-auto p-4">
                        <h3 className="text-lg font-orbitron text-center mb-4">Poster Collection</h3>
                        <div className="flex space-x-4 overflow-x-auto pb-4">
                            {generatedPosters.map(poster => (
                                <div key={poster.id} onClick={() => setActivePosterId(poster.id)}
                                    className={`flex-shrink-0 w-32 h-44 rounded-md overflow-hidden cursor-pointer border-4 transition-all duration-300 ${activePosterId === poster.id ? 'border-fuchsia-500 shadow-lg shadow-fuchsia-500/40' : 'border-gray-700 hover:border-gray-500'}`}>
                                    <img src={poster.src} alt="Generated Poster" className="w-full h-full object-cover"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default App;
