import { useState, useEffect, useCallback } from 'react';
import { FitnessData, WorkoutStats, ChartDataset, UserProfile, MuscleReadiness } from '../types';
import * as db from '../services/db';

const STEP_GOAL = 8000;
const CALORIE_TARGET = 2200;

export const useFitnessData = (user: UserProfile | null) => {
    const [data, setData] = useState<FitnessData>(db.getInitialFitnessData());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const loadedData = db.getFitnessData(user._id);
            setData(loadedData);
            setIsLoading(false);
        } else {
            setIsLoading(true);
            setData(db.getInitialFitnessData());
        }
    }, [user]);

    const saveData = useCallback((newData: FitnessData) => {
        if (user) {
            db.saveFitnessData(user._id, newData);
            setData(newData);
        }
    }, [user]);

    // Interval for passive stats gain (e.g., steps, background calorie burn)
    useEffect(() => {
        if (!user || isLoading) return;
        const userId = user._id;

        const stepInterval = setInterval(() => {
            setData(prevData => ({ ...prevData, steps: prevData.steps + Math.floor(Math.random() * 3) }));
        }, 5000);

        const calorieInterval = setInterval(() => {
            setData(prevData => ({ ...prevData, caloriesBurned: prevData.caloriesBurned + 1 }));
        }, 8000);
        
        // Persist data periodically instead of on every minor change
        const persistInterval = setInterval(() => {
            // Use a functional update with setData to get the latest state to save
            setData(currentData => {
                db.saveFitnessData(userId, currentData);
                return currentData;
            });
        }, 10000); // Save every 10 seconds

        return () => {
            clearInterval(stepInterval);
            clearInterval(calorieInterval);
            clearInterval(persistInterval);
        };
    }, [user, isLoading]);

    const addWorkout = useCallback((workout: WorkoutStats) => {
        setData(prevData => {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            const newWorkout = { ...workout, date: todayStr };

            // --- 1. Update Core Stats & History ---
            const newWorkoutHistory = [newWorkout, ...prevData.workoutHistory];
            // Use the more accurate calorie count from the workout itself
            const newCaloriesBurned = prevData.caloriesBurned + workout.calories;
            const newWorkoutTime = prevData.dailyActivity.workoutTime + Math.round(workout.duration / 60);
            const newCalendarData = {
                ...prevData.calendarHeatmapData,
                [todayStr]: Math.min((prevData.calendarHeatmapData[todayStr] || 0) + 1, 4),
            };

            // --- 2. Update Muscle Readiness & Recovery ---
            const getMuscleGroups = (category?: 'Lower body' | 'Upper body' | 'Cardio'): string[] => {
                if (category === 'Lower body') return ['Quads', 'Hamstrings', 'Glutes', 'Calves'];
                if (category === 'Upper body') return ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Abs'];
                return []; // Cardio affects many, keep it simple for now
            };
            const workedMuscles = getMuscleGroups(workout.exercise.category);
            const newMuscleReadiness = prevData.muscleReadiness.map((muscle): MuscleReadiness =>
                workedMuscles.includes(muscle.name) ? { ...muscle, readiness: 'recovering' } : muscle
            );
            const recoveringCount = newMuscleReadiness.filter(m => m.readiness === 'recovering').length;
            const soreCount = newMuscleReadiness.filter(m => m.readiness === 'sore').length;
            const newRecoveryScore = Math.max(0, 100 - (recoveringCount * 5) - (soreCount * 10));

            // --- 3. Update Weekly Highlights ---
            const lastWorkoutDate = prevData.workoutHistory[0]?.date;
            let newStreak = prevData.weeklyHighlights.streak;
            if (lastWorkoutDate !== todayStr) { // Prevents multiple workouts on same day from increasing streak
                if (lastWorkoutDate === yesterdayStr) {
                    newStreak += 1;
                } else {
                    newStreak = 1; // Reset streak
                }
            }
            const newWeeklyHighlights = {
                ...prevData.weeklyHighlights,
                caloriesBurned: prevData.weeklyHighlights.caloriesBurned + workout.calories,
                streak: newStreak,
            };

            // --- 4. Update Strength Data ---
            const newStrengthData = JSON.parse(JSON.stringify(prevData.strengthData)); // Deep copy
            const monthIndex = newStrengthData.labels.length - 1; // Always update last month for demo simplicity

            workout.exerciseBreakdown?.forEach(breakdown => {
                let valueToAdd = 0;
                const value = breakdown.value;
    
                if (value.includes('x')) {
                    const parts = value.split('x');
                    if (parts.length === 2) {
                        const sets = parseInt(parts[0], 10);
                        const repsOrSeconds = parseInt(parts[1], 10);
                        if (!isNaN(sets) && !isNaN(repsOrSeconds)) {
                            valueToAdd = sets * repsOrSeconds;
                        }
                    }
                } else {
                    const repsOrSeconds = parseInt(value, 10);
                    if (!isNaN(repsOrSeconds)) {
                        valueToAdd = repsOrSeconds;
                    }
                }
                
                const dataset = newStrengthData.datasets.find((d: ChartDataset) => d.exerciseId === breakdown.id);

                if (dataset && valueToAdd > 0) {
                    dataset.data[monthIndex] += valueToAdd;
                }
            });
            
            // --- 5. Assemble Final State ---
            const newData: FitnessData = {
                ...prevData,
                caloriesBurned: newCaloriesBurned,
                dailyActivity: { ...prevData.dailyActivity, workoutTime: newWorkoutTime },
                workoutHistory: newWorkoutHistory,
                calendarHeatmapData: newCalendarData,
                muscleReadiness: newMuscleReadiness,
                recoveryScore: newRecoveryScore,
                weeklyHighlights: newWeeklyHighlights,
                strengthData: newStrengthData,
            };

            saveData(newData);
            return newData;
        });
    }, [saveData]);

    const stepGoalPercentage = Math.min(Math.round((data.steps / STEP_GOAL) * 100), 100);
    const caloriesRemaining = Math.max(0, CALORIE_TARGET - data.caloriesBurned);

    return {
        data: {
            ...data,
            bmi: user?.bmi,
            bmr: user?.bmr,
        },
        isLoading,
        addWorkout,
        // Derived stats for simpler components
        stats: {
            steps: data.steps,
            caloriesBurned: data.caloriesBurned,
            stepGoal: STEP_GOAL,
            calorieTarget: CALORIE_TARGET,
            stepGoalPercentage,
            caloriesRemaining,
        }
    };
};

