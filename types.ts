export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    photo: string;
    gender: string;
    height: string;
    weight: string;
    age: number;
    fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    bmi?: number;
    bmr?: number;
}

// User now doesn't store a password on the client
export interface User extends UserProfile {
    // passwordHash is removed for security
}

// Define the specific landmark names for better type safety
export type LandmarkName = 'leftShoulder' | 'leftElbow' | 'leftWrist' | 'rightShoulder' | 'rightElbow' | 'rightWrist' | 'leftHip' | 'leftKnee' | 'leftAnkle' | 'rightHip' | 'rightKnee' | 'rightAnkle';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in minutes
  calories: number; // estimated calories burned
  image: string;
  subExercises?: Exercise[];
  aiInstructions?: string;
  category?: 'Lower body' | 'Upper body' | 'Cardio'; // Added for filtering

  // New properties for workout structure
  type?: 'reps' | 'time';
  sets?: number;
  reps?: number; // for rep-based exercises
  holdTime?: number; // for time-based exercises (in seconds)

  // New properties for enhanced accuracy and data-driven logic
  angleLandmarks?: [LandmarkName, LandmarkName, LandmarkName];
  angleThresholds?: { up: number; down: number; };
  metValue: number; // Metabolic Equivalent of Task
}

export interface Landmark {
  x: number;
  y: number;
}

export interface Landmarks {
  [key: string]: Landmark;
}

export interface CorrectionTip {
    message: string;
    importance: 'high' | 'medium' | 'low';
}

export interface AIFeedback {
  phase: 'up' | 'down' | 'neutral' | 'incorrect';
  formScore: number; // Score from 0-100
  correctionTips: CorrectionTip[];
  landmarks?: Landmarks;
}

export interface WorkoutStats {
    exercise: Exercise; // This will be the workout plan
    reps: number; // Total reps for the entire plan
    duration: number; // Total duration in seconds
    calories: number;
    exerciseBreakdown?: { id: string; name: string; value: string }[]; // e.g., { name: 'Squats', value: '3x12 Reps' }, { name: 'Plank', value: '3x30s' }
}


export interface UserStats {
    steps: number;
    caloriesBurned: number;
    stepGoal: number;
    calorieTarget: number;
    stepGoalPercentage: number;
    caloriesRemaining: number;
}

export interface MuscleReadiness {
    name: string;
    readiness: 'fresh' | 'recovering' | 'sore';
};

// New types for strongly-typed chart data
export interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    tension: number;
    exerciseId?: string;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}


export interface FitnessData {
    // From useUserStats
    steps: number;
    caloriesBurned: number;

    // From useProgressData
    dailyActivity: {
        cardioTime: number;
        workoutTime: number;
    };
    weeklyHighlights: {
        caloriesBurned: number;
        bestLift: { exercise: string; weight: number };
        streak: number;
    };
    workoutHistory: (WorkoutStats & { date: string })[];
    strengthData: ChartData; // Use the new strong type
    recoveryScore: number;
    muscleReadiness: MuscleReadiness[];
    goals: {
        primary: { name: string; progress: number };
        badges: string[];
    };
    calendarHeatmapData: Record<string, number>; // { [date: string]: intensity }
    // FIX: Add optional bmi and bmr to match the data structure from useFitnessData hook
    bmi?: number;
    bmr?: number;
}