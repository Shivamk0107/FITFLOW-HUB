import React, { useState } from 'react';
import { Exercise, UserStats, FitnessData } from '../types';
import { PLAN_WORKOUTS } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon, WalkingIcon, FlameIcon } from './icons/ControlIcons';

// --- Reusable Components for the New Dashboard ---

const DashboardCalendar: React.FC<{ heatmapData: Record<string, number> }> = ({ heatmapData }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();

    const changeMonth = (amount: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(1); 
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        
        let startDayOfWeek = firstDayOfMonth.getDay() - 1;
        if (startDayOfWeek === -1) startDayOfWeek = 6;

        const days = [];
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, intensity: 0 });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = new Date(year, month, i).toISOString().split('T')[0];
            days.push({ day: i, isCurrentMonth: true, intensity: heatmapData[dateStr] || 0 });
        }
        
        const gridTotal = 42;
        const remainingDays = gridTotal - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ day: i, isCurrentMonth: false, intensity: 0 });
        }
        
        return days;
    };

    const getIntensityColor = (intensity: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return 'bg-zinc-900/50';
        if (intensity === 0) return 'bg-zinc-900 hover:bg-zinc-800';
        if (intensity === 1) return 'bg-purple-900/50 hover:bg-purple-900/70';
        if (intensity === 2) return 'bg-purple-700/60 hover:bg-purple-700/80';
        return 'bg-purple-500/70 hover:bg-purple-500/90';
    };

    const calendarDays = getCalendarDays();
    const monthYearLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-zinc-900 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{monthYearLabel}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2.5 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"><ChevronLeftIcon /></button>
                    <button onClick={() => changeMonth(1)} className="p-2.5 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"><ChevronRightIcon /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-3 text-center">
                {daysOfWeek.map(day => <div key={day} className="text-zinc-500 font-bold text-sm">{day}</div>)}
                {calendarDays.map(({ day, isCurrentMonth, intensity }, index) => {
                    const isToday = isCurrentMonth && day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
                    
                    let dayClasses = `aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 font-semibold ${getIntensityColor(intensity, isCurrentMonth)}`;
                    
                    if (isCurrentMonth) {
                        dayClasses += isToday ? ' ring-2 ring-lime-300 text-white' : ' text-zinc-300';
                    } else {
                        dayClasses += ' text-zinc-700';
                    }

                    return <div key={index} className={dayClasses}>{day}</div>;
                })}
            </div>
        </div>
    );
};

const StatBar: React.FC<{ icon: React.ReactNode; label: string; value: number; goal: number; color: string; }> = ({ icon, label, value, goal, color }) => {
    const percentage = Math.min((value / goal) * 100, 100);
    return (
        <div className="bg-zinc-900 p-5 rounded-3xl">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <div className="text-white">{icon}</div>
                    <span className="font-bold text-white text-lg">{label}</span>
                </div>
                <span className="font-bold text-white">{value.toLocaleString()} <span className="text-zinc-400 text-sm">/ {goal.toLocaleString()}</span></span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2.5">
                <div 
                    className={`${color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%`}}
                ></div>
            </div>
        </div>
    );
};


const ForYouSuggestion: React.FC<{ fitnessData: FitnessData; onSelectExercise: (exercise: Exercise) => void }> = ({ fitnessData, onSelectExercise }) => {
    const { muscleReadiness } = fitnessData;
    const lowerBodyMuscles = ['Quads', 'Hamstrings', 'Glutes', 'Calves'];
    const upperBodyMuscles = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'];
    const isLowerBodyFresh = lowerBodyMuscles.every(m => muscleReadiness.find(mr => mr.name === m)?.readiness === 'fresh');
    const isUpperBodyFresh = upperBodyMuscles.every(m => muscleReadiness.find(mr => mr.name === m)?.readiness === 'fresh');

    let suggestion: { title: string; description: string; workout?: Exercise; color: string } | null = null;
    
    if (isLowerBodyFresh) {
        const workout = PLAN_WORKOUTS.find(p => p.category === 'Lower body');
        suggestion = { title: "It's Leg Day!", description: "Your lower body is fresh.", workout, color: 'bg-lime-300' };
    } else if (isUpperBodyFresh) {
        const workout = PLAN_WORKOUTS.find(p => p.category === 'Upper body');
        suggestion = { title: "Time for Upper Body", description: "Your upper body is recovered.", workout, color: 'bg-purple-400' };
    } else {
        const workout = PLAN_WORKOUTS.find(p => p.category === 'Cardio');
        suggestion = { title: "Active Recovery", description: "A light cardio session.", workout, color: 'bg-sky-400' };
    }

    if (!suggestion || !suggestion.workout) return null;
    const workout = suggestion.workout;
    return (
         <div onClick={() => onSelectExercise(workout)} className={`${suggestion.color} text-black rounded-3xl p-5 flex items-center justify-between cursor-pointer hover:scale-105 transition-transform`}>
            <div>
                <h3 className="font-bold text-xl">{suggestion.title}</h3>
                <p className="text-zinc-800/80 font-medium">{suggestion.description}</p>
            </div>
            <ChevronRightIcon className="w-8 h-8 flex-shrink-0" />
        </div>
    )
}

interface ActivityDashboardProps {
  onSelectExercise: (exercise: Exercise) => void;
  stats: UserStats;
  fitnessData: FitnessData;
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({ onSelectExercise, stats, fitnessData }) => {
    const todayFormatted = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl sm:text-4xl font-bold">Your Activity</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <DashboardCalendar heatmapData={fitnessData.calendarHeatmapData} />
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div>
                        <h2 className="text-2xl font-bold">Today's Snapshot</h2>
                        <p className="text-zinc-400">{todayFormatted}</p>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <StatBar 
                            icon={<WalkingIcon className="w-6 h-6" />}
                            label="Steps"
                            value={stats.steps}
                            goal={stats.stepGoal}
                            color="bg-purple-500"
                        />

                        <StatBar
                            icon={<FlameIcon className="w-6 h-6" />}
                            label="Calories"
                            value={stats.caloriesBurned}
                            goal={stats.calorieTarget}
                            color="bg-lime-400"
                        />
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-2">
                        <h2 className="text-2xl font-bold">For You</h2>
                        <ForYouSuggestion fitnessData={fitnessData} onSelectExercise={onSelectExercise} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityDashboard;