
import React from 'react';
import { useEffect, useState } from 'react';
import { LOADING_MESSAGES } from '../constants';

interface LoadingSpinnerProps {
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
    const [dynamicMessage, setDynamicMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDynamicMessage(prev => {
                const currentIndex = LOADING_MESSAGES.indexOf(prev);
                const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                return LOADING_MESSAGES[nextIndex];
            });
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-t-4 border-gray-600 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-cyan-300 font-semibold text-lg animate-pulse">{message || dynamicMessage}</p>
        </div>
    );
};

export default LoadingSpinner;
