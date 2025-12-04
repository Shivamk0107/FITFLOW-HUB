from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Literal
from datetime import datetime

# ----------------------------
# USER MODELS
# ----------------------------

class User(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    gender: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    fitnessLevel: Optional[str] = None
    age: Optional[int] = None
    photo: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    fullName: str
    email: EmailStr
    photo: Optional[str] = None
    gender: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    age: Optional[int] = None
    fitnessLevel: Optional[Literal["Beginner", "Intermediate", "Advanced"]] = "Beginner"
    bmi: Optional[float] = None
    bmr: Optional[float] = None


class UserSignup(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    gender: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    fitnessLevel: Optional[str] = None
    age: Optional[int] = None
    photo: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ----------------------------
# WORKOUT MODELS
# ----------------------------

class Workout(BaseModel):
    id: str
    user_id: str
    exercise: str
    reps: int
    sets: int
    calories: float
    duration: float
    timestamp: str


class WorkoutRecord(BaseModel):
    id: str
    user_id: str
    name: str
    duration: Optional[int] = None
    calories: Optional[int] = None
    timestamp: Optional[str] = None


# ----------------------------
# EXERCISE MODELS
# ----------------------------

class Exercise(BaseModel):
    id: str
    name: str
    description: str
    instructions: str
    difficulty: Literal["Beginner", "Intermediate", "Advanced"]
    duration: int  # in minutes
    calories: float
    image: Optional[str] = None
    category: Optional[str] = None
    type: Optional[Literal["reps", "time"]] = None
    sets: Optional[int] = 1
    reps: Optional[int] = 0
    holdTime: Optional[int] = 0
    metValue: Optional[float] = 1.0


# ----------------------------
# STATS MODEL (OPTIONAL)
# ----------------------------

class WorkoutStats(BaseModel):
    exercise: str
    reps: Optional[int] = None
    duration: Optional[float] = None
    calories: Optional[float] = None
    exerciseBreakdown: Optional[List[Dict[str, str]]] = None

class WorkoutProgress(BaseModel):
    user_id: str
    exercise: str
    count: int
    feedback: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

class ProgressEntry(BaseModel):
    user_id: str
    exercise: str
    count: int
    feedback: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

class UserProgress(BaseModel):
    user_id: str
    steps: int = 0
    caloriesBurned: float = 0.0
    dailyActivity: Dict[str, float] = {"workoutTime": 0.0, "cardioTime": 0.0}
    workoutHistory: List[Dict[str, str]] = []
    weeklyHighlights: Dict[str, float] = {"streak": 0.0, "caloriesBurned": 0.0}
    calendarHeatmapData: Dict[str, int] = {}
    strengthData: Dict[str, List] = {"labels": [], "datasets": []}

class ProgressData(BaseModel):
    user_id: str
    totalWorkouts: int = 0
    totalCalories: float = 0.0
    totalDuration: float = 0.0
    totalExercises: int = 0
    streakDays: int = 0
    lastUpdated: datetime = datetime.utcnow()
    weeklyData: Optional[List[Dict[str, float]]] = []  # e.g. [{ "day": "Mon", "calories": 120 }]

class Progress(BaseModel):
    user_id: str
    exercise: str
    reps: int
    sets: int
    calories_burned: float
    duration: Optional[float] = None  # in seconds or minutes
    date: datetime = Field(default_factory=datetime.utcnow)