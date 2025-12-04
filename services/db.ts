import { User, UserProfile, FitnessData, MuscleReadiness, ChartData } from '../types';
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000"; // 👈 your FastAPI backend
const DB_KEY = 'fitflow_users';
const SESSION_KEY = 'fitflow_session';
const FITNESS_DATA_KEY = 'fitflow_fitness_data';
const DEFAULT_AVATAR = "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

// --- Health Metric Calculation Utilities ---

const parseHeight = (heightStr: string): number => {
    if (!heightStr) return 0;
    const feetMatch = heightStr.match(/(\d+)'/);
    const inchesMatch = heightStr.match(/(\d+)"/);
    const feet = feetMatch ? parseInt(feetMatch[1], 10) : 0;
    const inches = inchesMatch ? parseInt(inchesMatch[1], 10) : 0;
    return (feet * 12 + inches) * 2.54;
};

const calculateBMR = (user: Pick<UserProfile, 'gender' | 'weight' | 'height' | 'age'>): number => {
    const weightKg = parseFloat(user.weight) * 0.453592;
    const heightCm = parseHeight(user.height);
    const age = user.age;
    if (!weightKg || !heightCm || !age) return 1500;

    if (user.gender.toLowerCase() === 'male') {
        return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
    }
};

const calculateBMI = (user: Pick<UserProfile, 'weight' | 'height'>): number => {
    const weightKg = parseFloat(user.weight) * 0.453592;
    const heightM = parseHeight(user.height) / 100;
    if (!weightKg || !heightM) return 0;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

// --- Fitness & Readiness Setup (Unchanged) ---

const initialStrengthData: ChartData = {
    labels: ['May', 'Jun', 'Jul', 'Aug'],
    datasets: [
        { label: 'Squat (reps)', exerciseId: 'squat', data: [0, 0, 0, 0], borderColor: '#a855f7', tension: 0.4 },
        { label: 'Push-ups (reps)', exerciseId: 'push-up', data: [0, 0, 0, 0], borderColor: '#d946ef', tension: 0.4 },
        { label: 'Plank (seconds)', exerciseId: 'plank', data: [0, 0, 0, 0], borderColor: '#ec4899', tension: 0.4 },
    ],
};

const initialMuscleReadiness: MuscleReadiness[] = [
    { name: 'Chest', readiness: 'fresh' }, { name: 'Back', readiness: 'fresh' },
    { name: 'Biceps', readiness: 'fresh' }, { name: 'Triceps', readiness: 'fresh' },
    { name: 'Shoulders', readiness: 'fresh' }, { name: 'Quads', readiness: 'fresh' },
    { name: 'Hamstrings', readiness: 'fresh' }, { name: 'Glutes', readiness: 'fresh' },
    { name: 'Calves', readiness: 'fresh' }, { name: 'Abs', readiness: 'fresh' },
];

// --- Local helpers (still used for fitness data only) ---
const getUsers = (): User[] => {
    const usersJson = localStorage.getItem(DB_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(DB_KEY, JSON.stringify(users));
};

// --- Fitness Data Management ---
export const getInitialFitnessData = (): FitnessData => ({
  steps: 0,
  caloriesBurned: 0,
  dailyActivity: { cardioTime: 0, workoutTime: 0 },
  weeklyHighlights: { caloriesBurned: 0, bestLift: { exercise: 'N/A', weight: 0 }, streak: 0 },
  workoutHistory: [],
  strengthData: initialStrengthData,
  recoveryScore: 100,
  muscleReadiness: initialMuscleReadiness,
  goals: { primary: { name: 'Set your first goal!', progress: 0 }, badges: [] },
  calendarHeatmapData: {},
});

export const getFitnessData = (userId: string): FitnessData => {
    const allData = JSON.parse(localStorage.getItem(FITNESS_DATA_KEY) || '{}');
    if (allData[userId]) return allData[userId];
    return getInitialFitnessData();
};

export const saveFitnessData = (userId: string, data: FitnessData) => {
    const allData = JSON.parse(localStorage.getItem(FITNESS_DATA_KEY) || '{}');
    allData[userId] = data;
    localStorage.setItem(FITNESS_DATA_KEY, JSON.stringify(allData));
};

// --- Backend-connected routes ---

export const addUser = async (userData: { username: string; email: string; password: string }): Promise<User> => {
    const response = await fetch(`${API_BASE}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Signup error:", errorData);
        throw new Error(errorData.detail || "Signup failed");
    }

    const newUser = await response.json();

    // Optional: store user in localStorage for offline support
    saveUsers([...getUsers(), newUser]);
    saveFitnessData(newUser._id, getInitialFitnessData());

    return newUser;
};

export const login = async (email: string, password: string): Promise<UserProfile | null> => {
    const response = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Login error:", errorData);
        throw new Error(errorData.detail || "Login failed");
    }

    const user = await response.json();
    localStorage.setItem(SESSION_KEY, user._id);
    return user;
};

// --- Session and Local User Helpers ---
export const getMostRecentUserWithPhoto = (): UserProfile | null => {
    const users = getUsers();
    for (let i = users.length - 1; i >= 0; i--) {
        if (users[i].photo && users[i].photo !== DEFAULT_AVATAR) return users[i];
    }
    return null;
};

export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): UserProfile | null => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    const users = getUsers();
    return users.find(u => u._id === userId) || null;
};

export const updateUser = async (user: UserProfile) => {
    if (!user._id) throw new Error("User ID missing");

    // 🔹 Exclude _id before sending to backend
    const { _id, ...payload } = user;

    try {
        const response = await fetch(`http://127.0.0.1:8000/user/${_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload), // ✅ safe data without _id
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Update failed:", error);
            throw new Error(error.detail || "Failed to update user");
        }

        const data = await response.json();
        console.log("✅ User updated successfully:", data);
        return data;
    } catch (err) {
        console.error("❌ Error updating user:", err);
        throw err;
    }
};

export function calculateCaloriesBurned(exerciseType: string, durationMinutes: number) {
  const caloriesPerMinute = {
    squats: 8,
    pushups: 7,
    lunges: 6,
    running: 10,
    jumpingjacks: 9,
  };

  const rate = caloriesPerMinute[exerciseType.toLowerCase()] || 5;
  return rate * durationMinutes;
}

