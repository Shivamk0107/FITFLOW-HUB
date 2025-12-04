import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Exercise, WorkoutStats, UserProfile } from './types';
import WorkoutTracker from './components/WorkoutTracker';
import Login from './components/Login';
import SignUp from './components/SignUp';
import WorkoutSummary from './components/WorkoutSummary';
import { BellIcon, FitFlowLogo } from './components/icons/ControlIcons';
import ActivityDashboard from './components/ActivityDashboard';
import WorkoutHub from './components/ExerciseSelector';
import BottomNav from './components/BottomNav';
import Settings from './components/Settings';
import ProgressDashboard from './components/ProgressDashboard';
import * as db from './services/db';
import { useFitnessData } from './hooks/useFitnessData';
import { useWebSocket } from "./hooks/useWebSocket"; // ✅ Added import

type View = 'activity' | 'plan' | 'progress' | 'settings';

const App: React.FC = () => {
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [screen, setScreen] = useState("auth");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutStats | null>(null);
  const [currentView, setCurrentView] = useState<View>('activity');
  
  const { data: fitnessData, stats: userStats, addWorkout } = useFitnessData(currentUser);

  // ✅ Initialize WebSocket only when exercise is active
  const exerciseName = selectedExercise ? selectedExercise.name.toLowerCase() : "";
  const { isConnected, messages, sendMessage } = useWebSocket(exerciseName);

  // ✅ Optional: log AI feedback in console

    
    useEffect(() => {
    if (messages.length > 0) {
      const latest = messages[messages.length - 1];
      console.log(`🤖 AI Trainer (${exerciseName}):`, latest);
    }
  }, [messages, exerciseName]);

      
    useEffect(() => {
      const savedUser = localStorage.getItem("fitflow_user");
      const savedToken = localStorage.getItem("fitflow_token");

      if (savedUser && savedToken) {
        try {
          const parsedUser: UserProfile = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Failed to parse saved user:", error);
          localStorage.removeItem("fitflow_user");
        }
      } else {
        try {
          // ✅ db.getCurrentUser() returns a value directly, not a Promise
          const user = db.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setIsLoggedIn(true);
          }
        } catch (err) {
          console.log("No user session found:", err);
        }
      }
    }, []);


  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setWorkoutSummary(null);
  };

  const handleWorkoutFinish = (stats: WorkoutStats) => {
    addWorkout(stats);
    setWorkoutSummary(stats);
    setSelectedExercise(null);
  };

  const handleBackToDashboard = () => {
    setSelectedExercise(null);
    setWorkoutSummary(null);
    setCurrentView('plan');
  };

  const handleRetry = () => {
    if (workoutSummary?.exercise) {
      setSelectedExercise(workoutSummary.exercise);
    }
    setWorkoutSummary(null);
  };
  
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);

    // ✅ Persist session
    localStorage.setItem("fitflow_user", JSON.stringify(user));
    if ((user as any).token) {
      localStorage.setItem("fitflow_token", (user as any).token);
    }
  };
  
  const handleSignUp = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);

    // ✅ Persist session
    localStorage.setItem("fitflow_user", JSON.stringify(user));
    if ((user as any).token) {
      localStorage.setItem("fitflow_token", (user as any).token);
    }
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setAuthView('login');
    setSelectedExercise(null);
    setWorkoutSummary(null);
  };

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'activity':
        return <ActivityDashboard onSelectExercise={handleSelectExercise} stats={userStats} fitnessData={fitnessData} />;
      case 'plan':
        return <WorkoutHub user={currentUser} onSelectExercise={handleSelectExercise} fitnessData={fitnessData} />;
      case 'progress':
        return <ProgressDashboard data={fitnessData} />;
      case 'settings':
        return currentUser && <Settings user={currentUser} onUpdate={handleUserUpdate} onLogout={handleLogout} />;
      default:
        return <ActivityDashboard onSelectExercise={handleSelectExercise} stats={userStats} fitnessData={fitnessData} />;
    }
  };

  const renderScreen = () => {
    if (workoutSummary) {
      return <WorkoutSummary stats={workoutSummary} onFinish={handleBackToDashboard} onRetry={handleRetry} />;
    }
    if (selectedExercise && currentUser) {
      return (
        <WorkoutTracker
          user={currentUser}
          exercise={selectedExercise}
          onFinish={handleWorkoutFinish}
          onBack={handleBackToDashboard}
          // ✅ Pass WebSocket props for AI feedback
          aiConnected={isConnected}
          aiMessages={messages}
          sendToAI={sendMessage}
        />
      );
    }

    const pageVariants = {
      initial: { opacity: 0, x: -20 },
      in: { opacity: 1, x: 0 },
      out: { opacity: 0, x: 20 },
    };

    const pageTransition = {
      type: 'tween',
      ease: 'anticipate',
      duration: 0.4,
    };
    
    return (
      <>
        <Header user={currentUser} />
        <main className="p-4 md:p-6 max-w-7xl mx-auto pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav activeView={currentView} setView={setCurrentView} />
      </>
    );
  };
  
  const Header: React.FC<{ user: UserProfile | null }> = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName = user?.fullName
    ? user.fullName.split(" ")[0].toUpperCase()
    : "USER";

  return (
    <header className="py-4 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={
              user?.photo ||
              "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
            }
            alt="User avatar"
            className="w-11 h-11 rounded-2xl object-cover"
          />
          <div>
            <span className="text-white font-bold text-base sm:text-lg">
              {getGreeting()}, {firstName}
            </span>
            <p className="text-xs text-zinc-400 capitalize">
              {user?.fitnessLevel || "Fitness Freak"}
            </p>
          </div>
        </div>
        <button className="relative text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full p-3.5">
          <BellIcon />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-purple-500 ring-2 ring-zinc-950"></span>
        </button>
      </div>
    </header>
  );
};



  if (!isLoggedIn || !currentUser) {
    if (authView === 'login') {
      return <Login onLogin={handleLogin} onNavigateToSignUp={() => setAuthView('signup')} />;
    } else {
      return <SignUp onSignUp={handleSignUp} onNavigateToLogin={() => setAuthView('login')} />;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {renderScreen()}
    </div>
  );
};

export default App;
