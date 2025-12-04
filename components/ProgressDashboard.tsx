import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FitnessData, ChartData, ChartDataset } from '../types';
import { ChevronRightIcon, DumbbellIcon, FlameIcon, WalkingIcon, CyclingIcon, MeditationIcon, TrophyIcon, TargetIcon, ChevronLeftIcon } from './icons/ControlIcons';

// --- Reusable Components ---
const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-zinc-900 rounded-3xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-5 text-left"
            >
                <h2 className="text-2xl font-bold">{title}</h2>
                <ChevronRightIcon className={`w-6 h-6 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && <div className="p-5 pt-0">{children}</div>}
        </div>
    );
};

const ActivityCard: React.FC<{ icon: React.ReactNode; title: string; value: string; time: string; color: string }> = ({ icon, title, value, time, color }) => (
    <div className={`rounded-3xl p-5 flex flex-col justify-between h-48 text-black`} style={{ backgroundColor: color }}>
        <div className="flex justify-between items-start">
            <div className="bg-black/20 text-white rounded-full p-3">
                {icon}
            </div>
            <p className="font-bold text-2xl sm:text-3xl text-right drop-shadow-sm">{value}</p>
        </div>
        <div>
            <p className="font-bold text-lg sm:text-xl">{title}</p>
            <div className="bg-white/80 rounded-full px-3 py-1 text-xs font-semibold inline-block mt-1">{time}</div>
        </div>
    </div>
);

const HighlightCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <div className={`rounded-3xl p-5 flex items-center gap-4 ${color}`}>
        <div className="text-3xl">{icon}</div>
        <div>
            <p className="font-bold text-lg sm:text-xl text-white">{value}</p>
            <p className="text-zinc-300 text-sm">{title}</p>
        </div>
    </div>
);

const FitnessTip: React.FC<{ text: string }> = ({ text }) => (
    <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 my-4">
        <p className="font-bold text-purple-300 mb-1">💡 Fitness Tip</p>
        <p className="text-zinc-300">{text}</p>
    </div>
);


const StrengthChart: React.FC<{ data: ChartData }> = ({ data }) => {
    const [activeBar, setActiveBar] = useState<{ datasetIndex: number; monthIndex: number } | null>(null);
    const { labels, datasets } = data;

    const chartHeight = 200;
    const maxVal = Math.max(10, Math.ceil(Math.max(...datasets.flatMap((d: ChartDataset) => d.data)) / 10) * 10);
    const yScale = (val: number) => (val / maxVal) * chartHeight;
    const yAxisLabels = maxVal > 0 ? [0, maxVal / 2, maxVal] : [0];

    return (
        <div className="p-4 bg-zinc-800/50 rounded-2xl">
            <div className="relative" style={{ height: `${chartHeight}px` }} onMouseLeave={() => setActiveBar(null)}>
                {/* Y-Axis Labels and Grid Lines */}
                {yAxisLabels.map(label => (
                    <div key={label} className="absolute w-full flex items-center" style={{ bottom: `${yScale(label)}px`, transform: 'translateY(50%)' }}>
                        <span className="text-xs text-zinc-500 pr-2">{label}</span>
                        <div className="flex-grow border-t border-zinc-700/50"></div>
                    </div>
                ))}

                {/* Bars */}
                <div className="absolute inset-0 flex justify-around px-2">
                    {labels.map((_, monthIndex) => (
                        <div key={monthIndex} className="h-full flex items-end justify-center gap-1 w-full">
                            {datasets.map((dataset, datasetIndex) => (
                                <div
                                    key={dataset.label}
                                    className="w-full rounded-t-sm transition-all duration-300 cursor-pointer"
                                    style={{
                                        height: `${(yScale(dataset.data[monthIndex]) / chartHeight) * 100}%`,
                                        backgroundColor: dataset.borderColor,
                                        opacity: activeBar && (activeBar.datasetIndex !== datasetIndex || activeBar.monthIndex !== monthIndex) ? 0.5 : 1
                                    }}
                                    onMouseEnter={() => setActiveBar({ datasetIndex, monthIndex })}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                {/* Tooltip */}
                {activeBar && (
                    <div className="absolute pointer-events-none p-2 bg-black/50 backdrop-blur-sm rounded-md text-white text-xs"
                         style={{
                             left: `${(activeBar.monthIndex / labels.length) * 100 + (100 / labels.length / 2)}%`,
                             bottom: `${(yScale(datasets[activeBar.datasetIndex].data[activeBar.monthIndex]) / chartHeight) * 100 + 5}%`,
                             transform: 'translateX(-50%)',
                         }}>
                        
                        
                        {( () => {
                            const labelText = datasets[activeBar.datasetIndex].label;
                            const unit = labelText.includes('(seconds)') ? 'sec' : labelText.includes('(reps)') ? 'reps' : '';
                            const exerciseName = labelText.split('(')[0].trim();
                            return <>
                                <p className="font-bold">{exerciseName}</p>
                                <p>{datasets[activeBar.datasetIndex].data[activeBar.monthIndex]} {unit} on {labels[activeBar.monthIndex]}</p>
                            </>
                        })()}

                    </div>
                )}
            </div>
             {/* X-Axis Labels */}
            <div className="flex justify-around mt-2 text-xs text-zinc-400">
                {labels.map((label: string) => <span key={label}>{label}</span>)}
            </div>
            {/* Legend */}
            <div className="flex justify-center items-center flex-wrap gap-4 mt-4 text-xs">
                {datasets.map(dataset => (
                    <div key={dataset.label} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: dataset.borderColor }}></div>
                        <span className="text-zinc-300">{dataset.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const MuscleReadinessMap = ({ muscles }: { muscles: {name: string, readiness: 'fresh' | 'recovering' | 'sore'}[]}) => {
    const getColor = (readiness: string) => {
        if (readiness === 'fresh') return 'bg-green-500/50 text-green-300';
        if (readiness === 'recovering') return 'bg-yellow-500/50 text-yellow-300';
        return 'bg-red-500/50 text-red-300';
    }
    return (
        <div className="grid grid-cols-2 gap-2">
            {muscles.map(m => (
                <div key={m.name} className={`text-sm text-center p-2 rounded-lg ${getColor(m.readiness)}`}>
                    {m.name}
                </div>
            ))}
        </div>
    );
};

const CalendarHeatmap: React.FC<{ data: Record<string, number> }> = ({ data }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(1); // Avoids issues with month lengths
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const gridDays = Array.from({ length: startDayOfWeek }, (_, i) => <div key={`empty-${i}`} className="aspect-square"></div>);

    const getIntensityColor = (day: number) => {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        const intensity = data[dateStr] || 0;
        if (intensity === 0) return 'bg-zinc-800';
        if (intensity === 1) return 'bg-purple-900';
        if (intensity === 2) return 'bg-purple-700';
        if (intensity === 3) return 'bg-purple-500';
        return 'bg-fuchsia-500';
    };

    for (let day = 1; day <= daysInMonth; day++) {
        gridDays.push(
            <div key={day} className={`aspect-square rounded-md flex items-center justify-center font-semibold text-sm ${getIntensityColor(day)}`}>
                {day}
            </div>
        );
    }

    return (
        <div className="bg-zinc-800/50 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 bg-zinc-700 rounded-full hover:bg-zinc-600"><ChevronLeftIcon className="w-4 h-4" /></button>
                    <button onClick={() => changeMonth(1)} className="p-2 bg-zinc-700 rounded-full hover:bg-zinc-600"><ChevronRightIcon className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-400 mb-2">
                {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {gridDays}
            </div>
            <div className="flex justify-center items-center gap-4 mt-4 text-xs text-zinc-400">
                <span>Less</span>
                <div className="w-4 h-4 rounded-sm bg-zinc-800"></div>
                <div className="w-4 h-4 rounded-sm bg-purple-900"></div>
                <div className="w-4 h-4 rounded-sm bg-purple-700"></div>
                <div className="w-4 h-4 rounded-sm bg-purple-500"></div>
                <div className="w-4 h-4 rounded-sm bg-fuchsia-500"></div>
                <span>More</span>
            </div>
        </div>
    );
};

const StreakFlame: React.FC<{ streak: number }> = ({ streak }) => {
    const flameSize = Math.min(24 + streak * 2, 48);
    const flameColor = streak > 14 ? 'text-red-500' : streak > 7 ? 'text-orange-500' : 'text-yellow-500';
    return (
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
            <FlameIcon className={`${flameColor} drop-shadow-lg`} style={{ width: flameSize, height: flameSize }} />
        </motion.div>
    );
};

// --- Main Component ---
interface ProgressDashboardProps {
    data: FitnessData;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ data }) => {
    const { dailyActivity, weeklyHighlights, workoutHistory, strengthData, recoveryScore, muscleReadiness, goals, calendarHeatmapData } = data;
    
    //FIX: Added defensive check for data.bmi and data.bmr which may be undefined
    const { bmi, bmr } = data;

    const fitnessTips = {
        fitness: workoutHistory.length > 0 ? "You've been consistent! Try increasing the intensity on your next lower body day." : "Start your first workout to get fitness tips.",
        strength: "Your squat is progressing well. Remember to focus on form to prevent injury.",
        goals: goals.primary.progress > 50 ? "You're over halfway to your goal! Keep up the great work." : "Consistency is key. Keep logging your workouts to reach your goals.",
    };

    const getBmiCategory = (bmiValue?: number) => {
        if (!bmiValue) return { category: 'N/A', color: 'text-zinc-400' };
        if (bmiValue < 18.5) return { category: 'Underweight', color: 'text-sky-400' };
        if (bmiValue < 24.9) return { category: 'Healthy Weight', color: 'text-lime-400' };
        if (bmiValue < 29.9) return { category: 'Overweight', color: 'text-yellow-400' };
        return { category: 'Obesity', color: 'text-red-400' };
    };

    const bmiInfo = getBmiCategory(bmi);

    return (
        <div className="pb-28 flex flex-col gap-8">
            <h1 className="text-3xl sm:text-4xl font-bold">Your Progress</h1>
            
            {/* Quick Summary */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Today's Activity</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ActivityCard icon={<WalkingIcon className="w-6 h-6" />} title="Cardio" value={`${dailyActivity.cardioTime} Mins`} time="Today" color="#a3e635" />
                    <ActivityCard icon={<DumbbellIcon className="w-6 h-6" />} title="Workout" value={`${dailyActivity.workoutTime} Mins`} time="Today" color="#c084fc" />
                </div>
            </div>
            
             <div>
                <h2 className="text-2xl font-bold mb-4">Weekly Highlights</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <HighlightCard icon={<FlameIcon />} title="Total Burned" value={`${weeklyHighlights.caloriesBurned} Kcal`} color="bg-zinc-900" />
                    <HighlightCard icon={<TrophyIcon />} title="Best Lift" value={`${weeklyHighlights.bestLift.weight}kg ${weeklyHighlights.bestLift.exercise}`} color="bg-zinc-900" />
                    <HighlightCard icon={<StreakFlame streak={weeklyHighlights.streak} />} title="Streak" value={`${weeklyHighlights.streak} Days`} color="bg-zinc-900" />
                </div>
            </div>
            
            <Section title="Health Metrics" defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-800/50 p-5 rounded-2xl text-center">
                        <p className="text-sm text-zinc-400">Body Mass Index (BMI)</p>
                        <p className="text-5xl font-bold my-2">{bmi || 'N/A'}</p>
                        <p className={`font-bold text-lg ${bmiInfo.color}`}>{bmiInfo.category}</p>
                    </div>
                    <div className="bg-zinc-800/50 p-5 rounded-2xl text-center">
                        <p className="text-sm text-zinc-400">Basal Metabolic Rate (BMR)</p>
                        <p className="text-5xl font-bold my-2">{bmr ? Math.round(bmr) : 'N/A'}</p>
                        <p className="font-bold text-lg text-zinc-400">Calories/day at rest</p>
                    </div>
                </div>
                <FitnessTip text="Your BMR and BMI are calculated from your profile data. Keep it updated for the most accurate insights!" />
            </Section>


            {/* Detailed Sections */}
            <Section title="Fitness Progress">
                <h3 className="font-bold text-lg mb-2">Workout History</h3>
                <div className="space-y-3 mb-6">
                    {workoutHistory.length > 0 ? workoutHistory.slice(0, 3).map((w, i) => (
                        <div key={i} className="bg-zinc-800/50 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{w.exercise.name}</p>
                                <p className="text-xs text-zinc-400">{w.date} - {Math.round(w.duration/60)} mins</p>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-zinc-500" />
                        </div>
                    )) : (
                         <div className="text-center py-6">
                            <p className="text-zinc-400">No workout history yet.</p>
                            <p className="text-zinc-500 text-sm">Complete a workout to see it here!</p>
                        </div>
                    )}
                </div>
                <FitnessTip text={fitnessTips.fitness} />

                <h3 className="font-bold text-lg mb-2 mt-6">Strength Tracking</h3>
                <StrengthChart data={strengthData} />
                <FitnessTip text={fitnessTips.strength} />
            </Section>

            <Section title="Health & Recovery">
                 <h3 className="font-bold text-lg mb-2">Recovery Score</h3>
                <div className="flex items-center justify-center my-4">
                    <div className="relative w-36 h-36">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-zinc-800" strokeWidth="10" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                            <circle
                                className="text-lime-400" strokeWidth="10" strokeDasharray="264" strokeDashoffset={264 - (recoveryScore/100 * 264)}
                                strokeLinecap="round" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{recoveryScore}</span>
                            <span className="text-xs text-zinc-400">/ 100</span>
                        </div>
                    </div>
                </div>
                 <h3 className="font-bold text-lg mb-2 mt-4">Muscle Readiness</h3>
                 <MuscleReadinessMap muscles={muscleReadiness} />
            </Section>

            <Section title="Goals & Achievements">
                <h3 className="font-bold text-lg mb-2">Primary Goal</h3>
                <p className="text-zinc-300">{goals.primary.name}</p>
                <div className="w-full bg-zinc-800 rounded-full h-3 my-2">
                    <div className="bg-lime-400 h-3 rounded-full" style={{width: `${goals.primary.progress}%`}}></div>
                </div>
                <p className="text-right text-sm text-zinc-400">{goals.primary.progress}% complete</p>
                
                <FitnessTip text={fitnessTips.goals} />

                <h3 className="font-bold text-lg mb-2 mt-6">Badges</h3>
                <div className="flex flex-wrap gap-2">
                    {goals.badges.length > 0 ? goals.badges.map(badge => (
                        <span key={badge} className="bg-yellow-500/20 text-yellow-300 text-sm font-semibold px-3 py-1 rounded-full">{badge}</span>
                    )) : (
                        <div className="text-center w-full py-6">
                            <p className="text-zinc-400">No badges earned yet.</p>
                            <p className="text-zinc-500 text-sm">Earn badges by completing challenges!</p>
                        </div>
                    )}
                </div>
            </Section>

            <Section title="Visual Analytics">
                <h3 className="font-bold text-lg mb-2">Workout Consistency</h3>
                <CalendarHeatmap data={calendarHeatmapData} />
            </Section>
        </div>
    );
};

export default ProgressDashboard;