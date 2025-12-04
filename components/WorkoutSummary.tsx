import React from 'react';
import { WorkoutStats } from '../types';
import { FireIcon, RetryIcon } from './icons/ControlIcons';

interface WorkoutSummaryProps {
  stats: WorkoutStats;
  onFinish: () => void;
  onRetry: () => void;
}

const StatDisplay: React.FC<{ value: string | number; label: string; className?: string }> = ({ value, label, className }) => (
    <div className={`bg-zinc-900 p-6 rounded-3xl text-center ${className}`}>
        <p className="text-4xl md:text-5xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm text-zinc-400 uppercase tracking-wider">{label}</p>
    </div>
);


const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ stats, onFinish, onRetry }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-4 min-h-[90vh]">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">Great Job!</h1>
          <p className="text-lg text-zinc-400 mt-2">You've successfully completed the {stats.exercise.name}.</p>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 mb-8">
            <StatDisplay value={stats.reps} label="Total Reps" />
            <StatDisplay value={formatTime(stats.duration)} label="Duration" />
            <StatDisplay value={stats.calories} label="Kcal Burned" className="col-span-2 bg-lime-300 text-zinc-900" />
        </div>

        {stats.exerciseBreakdown && (
            <div className="w-full bg-zinc-900 rounded-3xl p-6 mb-8 text-left">
                <h3 className="text-xl font-bold text-white mb-4">Exercises Completed</h3>
                <ul className="space-y-3">
                    {stats.exerciseBreakdown.map((ex, index) => (
                        <li key={index} className="flex justify-between items-center text-zinc-300 border-b border-zinc-800 pb-2">
                            <span className="text-lg">{ex.name}</span>
                            <span className="font-semibold text-lg text-white">{ex.value}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}


        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <button 
            onClick={onFinish} 
            className="bg-white hover:bg-zinc-200 text-black font-bold py-4 px-8 rounded-full transition-colors text-lg w-full"
          >
            Back to Plan
          </button>
          <button 
            onClick={onRetry} 
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-8 rounded-full transition-colors text-lg w-full"
          >
            <RetryIcon />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSummary;