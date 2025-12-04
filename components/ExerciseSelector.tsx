import React, { useState, useEffect, useMemo } from 'react';
import { Exercise, FitnessData, UserProfile } from '../types';
import { PLAN_WORKOUTS, EXERCISES } from '../constants';
import { ChevronRightIcon, DumbbellIcon, TargetIcon, DiceIcon } from './icons/ControlIcons';

interface WorkoutHubProps {
  user: UserProfile;
  onSelectExercise: (exercise: Exercise) => void;
  fitnessData: FitnessData;
}

const WEEKLY_GOAL = 3; // e.g., 3 workouts per week

const WeeklyGoal: React.FC<{ workoutsCompleted: number }> = ({ workoutsCompleted }) => {
    const progress = Math.min((workoutsCompleted / WEEKLY_GOAL) * 100, 100);
    return (
        <div className="bg-zinc-900 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl sm:text-2xl font-bold">Weekly Goal</h3>
                <div className="flex items-center gap-2 text-lime-300 font-semibold">
                    <TargetIcon className="w-6 h-6" />
                    <span>{workoutsCompleted} / {WEEKLY_GOAL} Workouts</span>
                </div>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3">
                <div
                    className="bg-lime-300 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-zinc-400 text-sm mt-3">Complete {WEEKLY_GOAL} workouts this week to build a strong routine!</p>
        </div>
    );
};

const QuickStart: React.FC<{ user: UserProfile, onSelectExercise: (exercise: Exercise) => void }> = ({ user, onSelectExercise }) => {
    const [quickStartExercises, setQuickStartExercises] = useState<Exercise[]>([]);

    const filteredExercises = useMemo(() => {
        const level = user.fitnessLevel;
        if (level === 'Beginner') {
            return EXERCISES.filter(ex => ex.difficulty === 'Beginner');
        }
        if (level === 'Intermediate') {
            return EXERCISES.filter(ex => ex.difficulty === 'Beginner' || ex.difficulty === 'Intermediate');
        }
        return EXERCISES; // Advanced gets all
    }, [user.fitnessLevel]);

    useEffect(() => {
        // Set initial exercises on mount from the filtered list
        const shuffled = [...filteredExercises].sort(() => 0.5 - Math.random());
        setQuickStartExercises(shuffled.slice(0, 3));
    }, [filteredExercises]);
    
    const handleRandomize = () => {
        const currentIds = new Set(quickStartExercises.map(ex => ex.id));
        // Get all exercises from the filtered list that are NOT currently displayed
        const availableForRandom = filteredExercises.filter(ex => !currentIds.has(ex.id));

        // Simple shuffle algorithm
        for (let i = availableForRandom.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableForRandom[i], availableForRandom[j]] = [availableForRandom[j], availableForRandom[i]];
        }

        // If there aren't enough *new* exercises from the filtered list, shuffle the whole filtered list
        if (availableForRandom.length < 3) {
             const allShuffled = [...filteredExercises].sort(() => 0.5 - Math.random());
             setQuickStartExercises(allShuffled.slice(0, 3));
             return;
        }

        setQuickStartExercises(availableForRandom.slice(0, 3));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl sm:text-2xl font-bold">Quick Start</h3>
              <button 
                  onClick={handleRandomize} 
                  className="p-2.5 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
                  aria-label="Randomize exercises"
              >
                  <DiceIcon />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickStartExercises.map(ex => (
                    <button
                        key={ex.id}
                        onClick={() => onSelectExercise({ ...ex, type: 'reps', sets: 3, reps: 10, subExercises: [{ ...ex, type: 'reps', sets: 3, reps: 10 }]})}
                        className="bg-zinc-900 p-5 rounded-2xl text-left hover:bg-zinc-800 transition-colors flex items-center gap-4"
                    >
                        <img src={ex.image} alt={ex.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                            <p className="font-bold text-lg">{ex.name}</p>
                            <p className="text-sm text-zinc-400">{ex.difficulty}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const WorkoutHub: React.FC<WorkoutHubProps> = ({ user, onSelectExercise, fitnessData }) => {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Lower body' | 'Upper body' | 'Cardio'>('All');
const workoutsThisWeek = (fitnessData?.workoutHistory ?? [])
  .filter(w => {
    const workoutDate = new Date(w.date);
    return workoutDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }).length;

  const filteredPlans = useMemo(() => {
    if (filter === 'All') {
      return PLAN_WORKOUTS;
    }
    return PLAN_WORKOUTS.filter(plan => plan.category === filter);
  }, [filter]);

  const handleTogglePlan = (planId: string) => {
    setExpandedPlan(prev => (prev === planId ? null : planId));
  };
  
  const filterCategories: ('All' | 'Lower body' | 'Upper body' | 'Cardio')[] = ['All', 'Lower body', 'Upper body', 'Cardio'];
  
  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-3xl sm:text-4xl font-bold">Workout Hub</h1>
      
      <WeeklyGoal workoutsCompleted={workoutsThisWeek} />
      <QuickStart user={user} onSelectExercise={onSelectExercise} />
      
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Your Workout Plans</h2>
        
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
            {filterCategories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-colors whitespace-nowrap ${filter === cat ? 'bg-lime-300 text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="flex flex-col gap-6">
          {filteredPlans.length > 0 ? (
            filteredPlans.map(workout => {
              const isExpanded = expandedPlan === workout.id;
              return (
                <div key={workout.id}>
                  <div onClick={() => handleTogglePlan(workout.id)} className={`bg-zinc-900 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 cursor-pointer transition-all duration-300 ${isExpanded ? 'rounded-t-[2.5rem]' : 'rounded-[2.5rem]'}`}>
                    <img src={workout.image} alt={workout.name} className="h-32 w-full sm:h-36 sm:w-36 rounded-3xl object-cover" />
                    <div className="flex-grow w-full flex justify-between items-center mt-4 sm:mt-0">
                      <div>
                        <h3 className="font-bold text-xl sm:text-2xl">{workout.name}</h3>
                        <div className="flex items-center gap-2 mt-3">
                            <div className="bg-purple-500/20 text-purple-300 text-sm font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                              <DumbbellIcon className="w-4 h-4" />
                              {workout.category}
                            </div>
                            <div className="bg-zinc-800 text-white text-sm font-semibold px-4 py-1.5 rounded-full inline-block">
                              {workout.duration} mins
                            </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <ChevronRightIcon className={`w-8 h-8 text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-zinc-800 rounded-b-[2.5rem] p-6">
                      <h4 className="font-semibold text-zinc-200 mb-4 px-2 text-lg">Exercises in this plan:</h4>
                      <ul className="space-y-3 mb-6">
                        {workout.subExercises?.map(subEx => (
                          <li 
                            key={subEx.id} 
                            className="flex justify-between items-center p-4 bg-zinc-700/50 rounded-2xl"
                          >
                            <div className="flex items-center gap-4">
                              <img src={subEx.image} alt={subEx.name} className="w-14 h-14 rounded-lg object-cover"/>
                              <div>
                                  <p className="font-bold text-white text-lg">{subEx.name}</p>
                                  <p className="text-sm text-zinc-400">{subEx.difficulty}</p>
                              </div>
                            </div>
                            <div className="text-right">
                               <p className="font-bold text-white text-lg">
                                  {subEx.sets} x {subEx.type === 'reps' ? `${subEx.reps} reps` : `${subEx.holdTime}s`}
                               </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <button 
                          onClick={() => onSelectExercise(workout)}
                          className="w-full bg-lime-300 text-black font-bold py-4 rounded-full text-lg hover:bg-lime-400 transition-colors"
                      >
                          Start Workout
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-zinc-900 rounded-3xl">
                <p className="text-zinc-400">No workout plans found for the '{filter}' category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutHub;