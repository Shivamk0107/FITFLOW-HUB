  import React, { useState, useRef, useEffect, useCallback, useReducer } from 'react';
  import { Exercise, WorkoutStats, UserProfile } from '../types';
  import { useCamera } from '../hooks/useCamera';
  import { calculateCaloriesBurned } from '../services/db';
  import { LoadingIcon, RetryIcon, PauseIcon, ChevronLeftIcon, CheckIcon, InformationCircleIcon, CloseIcon } from './icons/ControlIcons';
  import CircularProgress from './CircularProgress';
  import axios from 'axios';

  

  // --- Types and Constants ---
  const REST_PERIOD_SECONDS = 30;
  const REST_BETWEEN_EXERCISES_SECONDS = 60;
  const INITIAL_COUNTDOWN_SECONDS = 3;
  const FRAME_SEND_INTERVAL_MS = 200; // Send frames every 200ms (5 FPS)
  // NOTE: if your TS complains about import.meta, cast to any (Vite env)
  const WEBSOCKET_URL = (import.meta as any).env?.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/ai_trainer/';
  

  type WorkoutPhase = 'idle' | 'starting' | 'countdown' | 'exercising' | 'paused' | 'resting' | 'error';

  interface BackendData {
    count: number;
    status: string;
    frame?: string; // base64 encoded image string (data URL or raw base64)
  }

  interface WorkoutState {
    phase: WorkoutPhase;
    currentExerciseIndex: number;
    currentSet: number;
    timedSetTimer: number;
    restCountdown: number | null;
    initialCountdown: number | null;
    totalElapsedTime: number;
    errorMessage: string | null;
  }

  type WorkoutAction =
    | { type: 'START_REQUEST' }
    | { type: 'CAMERA_READY' }
    | { type: 'WEBSOCKET_ERROR'; payload: string }
    | { type: 'COUNTDOWN_TICK' }
    | { type: 'TOGGLE_PAUSE' }
    | { type: 'TICK_SECOND' }
    | { type: 'FINISH_SET'; payload: { isLastSet: boolean; isLastExercise: boolean } }
    | { type: 'REST_TICK' }
    | { type: 'FINISH_REST'; payload: { isNewExercise: boolean } }
    | { type: 'RESET'; payload: Exercise };

  const repBeep = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
  const restBeep = new Audio('https://actions.google.com/sounds/v1/notifications/quick_notice.ogg');
  const finishBeep = new Audio('https://actions.google.com/sounds/v1/events/success.ogg');

  // --- Reducer Logic ---
  const createInitialState = (firstExercise: Exercise): WorkoutState => ({
    phase: 'idle',
    currentExerciseIndex: 0,
    currentSet: 1,
    timedSetTimer: firstExercise?.holdTime || 0,
    restCountdown: null,
    initialCountdown: null,
    totalElapsedTime: 0,
    errorMessage: null,
  });

  function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
    switch (action.type) {
      case 'START_REQUEST':
        return { ...state, phase: 'starting', errorMessage: null };
      case 'CAMERA_READY':
        return { ...state, phase: 'countdown', initialCountdown: INITIAL_COUNTDOWN_SECONDS };
      case 'WEBSOCKET_ERROR':
        return { ...state, phase: 'error', errorMessage: action.payload };
      case 'COUNTDOWN_TICK':
        if (state.initialCountdown === null || state.initialCountdown <= 1) return { ...state, phase: 'exercising', initialCountdown: null };
        return { ...state, initialCountdown: state.initialCountdown - 1 };
      case 'TOGGLE_PAUSE':
        return { ...state, phase: state.phase === 'paused' ? 'exercising' : 'paused' };
      case 'TICK_SECOND':
        return { ...state, totalElapsedTime: state.totalElapsedTime + 1 };
      case 'FINISH_SET': {
        const { isLastSet, isLastExercise } = action.payload;
        if (isLastSet && isLastExercise) {
          finishBeep.play().catch(console.error);
          return state;
        }
        restBeep.play().catch(console.error);
        const restDuration = isLastSet ? REST_BETWEEN_EXERCISES_SECONDS : REST_PERIOD_SECONDS;
        return { ...state, phase: 'resting', restCountdown: restDuration };
      }
      case 'REST_TICK':
        if (state.restCountdown === null || state.restCountdown <= 1) return state;
        return { ...state, restCountdown: state.restCountdown - 1 };
      case 'FINISH_REST': {
        const { isNewExercise } = action.payload;
        const nextExerciseIndex = isNewExercise ? state.currentExerciseIndex + 1 : state.currentExerciseIndex;
        const nextSet = isNewExercise ? 1 : state.currentSet + 1;
        return {
          ...state,
          phase: 'exercising',
          restCountdown: null,
          currentExerciseIndex: nextExerciseIndex,
          currentSet: nextSet,
        };
      }
      case 'RESET':
        return createInitialState(action.payload);
      default:
        return state;
    }
  }

  const mapExerciseIdToBackend = (id: string): string => {
    const mapping: Record<string, string> = {
      'push-up': 'pushups',
      'squat': 'squats',
      'bicep-curl': 'bicepcurls',
      'lunges': 'lunges',
      'crunches': 'crunches',
      'tricep-dips': 'tricepdips',
      'jumping-jacks': 'jumpingjacks',
      'plank': 'plank',
      'step-ups': 'stepup',
      'wall-sits': 'wallsits',
      'calf-raises': 'calfraise',
      'mountain-climbers': 'mountainclimbers',
      'jump-rope': 'jumprope',
      'high-knees': 'highknee',
      'butt-kicks': 'buttkicks'
    };
    return mapping[id] || id;
  };

  // --- Components ---
  const InstructionsModal: React.FC<{ exercise: Exercise; onClose: () => void }> = ({ exercise, onClose }) => (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 relative max-w-md w-full">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><CloseIcon /></button>
        <h3 className="text-2xl font-bold mb-4 text-white">{exercise.name}</h3>
        <div className="text-zinc-300 space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {exercise.instructions.split('\n').map((line, index) => <p key={index}>{line}</p>)}
        </div>
      </div>
    </div>
  );

  const RestScreen: React.FC<{ countdown: number, nextExerciseName: string, nextSet: number, totalSets: number }> = ({ countdown, nextExerciseName, nextSet, totalSets }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 backdrop-blur-md z-30">
      <p className="text-2xl font-bold mb-2">REST</p>
      <p className="text-8xl font-black">{countdown}</p>
      <div className="mt-4 text-center">
        <p className="text-zinc-400">Up next:</p>
        <p className="text-3xl font-bold">{nextExerciseName}</p>
        <p className="text-lg text-zinc-300">Set {nextSet} of {totalSets}</p>
      </div>
    </div>
  );

  // --- Main Tracker Component ---
  interface WorkoutTrackerProps {
    user: UserProfile;
    exercise: Exercise; // This is a workout PLAN
    onBack: () => void;
    onFinish: (stats: WorkoutStats) => void;
  }

  const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ user, exercise: plan, onBack, onFinish }) => {
    const { videoRef, startCamera, stopCamera, error: cameraError, isCameraReady } = useCamera();
    const captureCanvasRef = useRef<HTMLCanvasElement>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const frameIntervalRef = useRef<number | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const hasFinishedRef = useRef(false);
    const exercises = plan.subExercises || [];
    const [state, dispatch] = useReducer(workoutReducer, createInitialState(exercises[0]));
    const { phase, currentExerciseIndex, currentSet, restCountdown, initialCountdown, totalElapsedTime, errorMessage } = state;
    const [backendData, setBackendData] = useState<BackendData>({ count: 0, status: 'Connecting...', frame: undefined });

    // SINGLE-SET MODE: combine sets into a single (more reps) set, as requested.
    // We'll compute effective targetReps as reps * sets to avoid multi-set transitions.
    const currentExercise = exercises[currentExerciseIndex];
    const isTimedExercise = currentExercise?.type === 'time';
    const originalReps = currentExercise?.reps || 1;
    const originalSets = currentExercise?.sets || 1;
    const targetReps = originalReps * originalSets; // single-set behavior
    const targetHoldTime = currentExercise?.holdTime || 1;
    const totalSets = 1; // force single-set UX as requested

    const [lastRepBeepCount, setLastRepBeepCount] = useState(0);

    const workoutStatsRef = useRef<{ totalReps: number; totalCalories: number; exerciseBreakdown: { id: string; name: string; value: string }[]; }>(
      { totalReps: 0, totalCalories: 0, exerciseBreakdown: [] }
    ).current;

    // Play a sound when the rep count from the backend increases
    useEffect(() => {
      if (backendData.count > lastRepBeepCount) {
        repBeep.play().catch(console.error);
        setLastRepBeepCount(backendData.count);
      }
    }, [backendData.count, lastRepBeepCount]);

    const handleFinishSet = useCallback(() => {
  const isLastSet = currentSet >= totalSets;
  const isLastExercise = currentExerciseIndex >= exercises.length - 1;

  if (!isTimedExercise) {
    workoutStatsRef.totalReps += backendData.count;
  }

  if (isLastSet && isLastExercise) {
    // ✅ Prevent duplicate finish calls
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    finishBeep.play().catch(console.error);
    onFinish({
      exercise: plan,
      reps: workoutStatsRef.totalReps,
      duration: totalElapsedTime,
      calories: Math.round(workoutStatsRef.totalCalories),
      exerciseBreakdown: workoutStatsRef.exerciseBreakdown,
    });
  } else {
    dispatch({ type: 'FINISH_SET', payload: { isLastSet, isLastExercise } });
  }
}, [currentSet, totalSets, currentExerciseIndex, exercises.length, backendData.count, workoutStatsRef, onFinish, plan, totalElapsedTime, currentExercise, isTimedExercise]);

    useEffect(() => {
      hasFinishedRef.current = false;
    }, [plan]);

    // --- CAMERA SETUP: ensure preview plays and reuse stream ---
    useEffect(() => {
      const setup = async () => {
        const v = videoRef.current;
        if (!v) return;
        // If stream already attached, do nothing
        if (v.srcObject) return;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 }, audio: false });
          v.srcObject = stream;
          await v.play().catch(() => {});
        } catch (err) {
          console.warn('Camera setup (fallback) failed:', err);
        }
      };
      setup();
      return () => {
        // camera stop handled by handleBack/stopCamera
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoRef]);

    // --- WEBSOCKET + FRAME SENDING (single robust effect with reconnect) ---
    useEffect(() => {
      // Only connect when exercising and we have an exercise selected
      if (!(phase === 'exercising' && currentExercise)) {
        // If not exercising, ensure any existing WS and interval are cleaned up
        if (socketRef.current) {
          try { socketRef.current.close(); } catch (e) {}
          socketRef.current = null;
        }
        if (frameIntervalRef.current !== null) {
          window.clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
        // Reset reconnect attempts when leaving exercising
        reconnectAttemptsRef.current = 0;
        if (reconnectTimeoutRef.current !== null) {
          window.clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        return;
      }

      let closedByUs = false;
      const exerciseId = mapExerciseIdToBackend(currentExercise.id);
      const wsUrl = `${WEBSOCKET_URL}${exerciseId}`;

      // Connector that can attempt reconnect with exponential backoff
      const connect = () => {
        // prevent duplicate connection
        if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
          return;
        }

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          console.log(`✅ WebSocket connected for ${exerciseId}`);
          reconnectAttemptsRef.current = 0;
          setBackendData({ count: 0, status: `Connected to ${exerciseId}`, frame: undefined });
          setLastRepBeepCount(0);
        };

        ws.onmessage = (event) => {
          try {
            const raw = event.data;
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            const frameSrc = parsed.frame
              ? (typeof parsed.frame === 'string' && parsed.frame.startsWith('data:') ? parsed.frame : `data:image/jpeg;base64,${parsed.frame}`)
              : undefined;

            setBackendData((prev) => ({
              count: typeof parsed.count === 'number' ? parsed.count : prev.count || 0,
              status: parsed.feedback || parsed.status || (typeof parsed.count === 'number' ? `Reps: ${parsed.count}` : prev.status),
              frame: frameSrc,
            }));
          } catch (err) {
            console.error('Failed to parse WS message:', err, event.data);
          }
        };

        ws.onerror = (ev) => {
          console.error('WebSocket error for', exerciseId, ev);
          // show friendly message but keep trying to reconnect
          dispatch({ type: 'WEBSOCKET_ERROR', payload: 'Connection issue with AI trainer — retrying...' });
        };

        ws.onclose = (ev) => {
          console.warn(`WebSocket closed for ${exerciseId}`, ev);
          // clean-up interval
          if (frameIntervalRef.current !== null) {
            window.clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
          }
          if (closedByUs) {
            socketRef.current = null;
            return;
          }
          socketRef.current = null;

          // attempt reconnect with backoff
          reconnectAttemptsRef.current += 1;
          const attempt = reconnectAttemptsRef.current;
          const backoff = Math.min(30000, 500 + attempt * 1000); // 0.5s + n*1s up to 30s
          setBackendData((prev) => ({ ...prev, status: `Disconnected — reconnecting in ${Math.round(backoff/1000)}s` }));

          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, backoff);
        };

        // start sending frames once socket is open
        const startSending = () => {
          if (!ws || ws.readyState !== WebSocket.OPEN) return;
          if (frameIntervalRef.current !== null) {
            window.clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
          }

          frameIntervalRef.current = window.setInterval(() => {
            try {
              const video = videoRef.current;
              if (!video) return;
              if (ws.readyState !== WebSocket.OPEN) return;

              // prefer hidden capture canvas ref
              let canvas = captureCanvasRef.current;
              let createdCanvas = false;
              if (!canvas) {
                canvas = document.createElement('canvas');
                createdCanvas = true;
              }

              const vw = video.videoWidth || 640;
              const vh = video.videoHeight || 480;
              if (!vw || !vh) {
                if (createdCanvas) { /* nothing */ }
                return;
              }

              canvas.width = vw;
              canvas.height = vh;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;

              // Mirror horizontally to match preview
              ctx.save();
              ctx.scale(-1, 1);
              ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
              ctx.restore();

              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ frame: dataUrl }));
              }

              if (createdCanvas) {
                // allow GC
                // @ts-ignore
                canvas = null;
              }
            } catch (err) {
              console.error('Error sending frame:', err);
            }
          }, FRAME_SEND_INTERVAL_MS);
        };

        // Trigger startSending either immediately if open or once open
        if (ws.readyState === WebSocket.OPEN) startSending();
        else {
          const onOpenOnce = () => {
            startSending();
            ws.removeEventListener('open', onOpenOnce);
          };
          ws.addEventListener('open', onOpenOnce);
        }
      }; // connect()

      // start initial connection
      connect();

      // teardown on effect cleanup
      return () => {
        closedByUs = true;
        if (reconnectTimeoutRef.current !== null) {
          window.clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        if (frameIntervalRef.current !== null) {
          window.clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
        try {
          if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
            socketRef.current.close();
          }
        } catch (e) { /* ignore */ }
        socketRef.current = null;
      };
    }, [phase, currentExercise]); // runs when exercise/phase changes

    // Handle set completion based on backend count (single-set behavior)
    useEffect(() => {
      if (phase !== 'exercising') return;

      if (isTimedExercise) {
        if (backendData.count >= targetHoldTime) handleFinishSet();
      } else {
        if (backendData.count >= targetReps) handleFinishSet();
      }
    }, [phase, backendData.count, isTimedExercise, targetHoldTime, targetReps, handleFinishSet]);

    useEffect(() => {
      if (phase !== 'exercising' && phase !== 'resting' && phase !== 'countdown') return;

      const interval = setInterval(() => {
        switch (phase) {
          case 'countdown':
            dispatch({ type: 'COUNTDOWN_TICK' });
            break;
          case 'exercising': {
            const caloriesPerSecond = user.bmr && currentExercise.metValue ? calculateCaloriesBurned(user.bmr, currentExercise.metValue, ) : 0;
            workoutStatsRef.totalCalories += caloriesPerSecond;
            dispatch({ type: 'TICK_SECOND' });
            break;
          }
          case 'resting':
            if (restCountdown !== null && restCountdown > 1) {
              dispatch({ type: 'REST_TICK' });
            } else {
              const isNewExercise = currentSet >= totalSets;
              dispatch({ type: 'FINISH_REST', payload: { isNewExercise } });
              setBackendData({ count: 0, status: 'Starting...', frame: undefined });
              setLastRepBeepCount(0);
            }
            break;
        }
      }, 1000);
      return () => clearInterval(interval);
    }, [phase, user.bmr, currentExercise, workoutStatsRef, restCountdown, currentSet, totalSets]);

    useEffect(() => {
      if (isCameraReady && phase === 'starting') dispatch({ type: 'CAMERA_READY' });
      setBackendData({ count: 0, status: 'Starting...', frame: undefined });
      setLastRepBeepCount(0);
    }, [isCameraReady, phase]);

    const handleBack = () => {
      // Close WebSocket + stop camera via hook
      try {
        if (frameIntervalRef.current !== null) {
          window.clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
        if (reconnectTimeoutRef.current !== null) {
          window.clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      } catch (e) { /* ignore */ }

      stopCamera();
      onBack();
    };

    useEffect(() => {
    return () => {
      // Cleanup when component unmounts or workout finishes
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch {}
        socketRef.current = null;
      }

      if (frameIntervalRef.current !== null) {
        window.clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }

      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      stopCamera();
    };
  }, []);

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    };

    const repProgress = isTimedExercise
      ? (targetHoldTime ? (backendData.count / targetHoldTime) * 100 : 0)
      : (targetReps ? Math.min(100, (backendData.count / targetReps) * 100) : 0);
    const setProgress = (currentSet / Math.max(1, totalSets)) * 100;

    return (
      <div className="fixed inset-0 bg-black z-50">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
        />
        <canvas ref={captureCanvasRef} className="hidden" />

        {backendData.frame ? (
          <img src={backendData.frame} alt="Processed workout frame" className="w-full h-full object-cover transform scale-x-[-1]" />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
            {(phase === 'exercising' || phase === 'paused') && <LoadingIcon />}
          </div>
        )}

        <div className="absolute top-0 inset-x-0 p-4 z-20 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <button onClick={handleBack} className="bg-zinc-900/50 backdrop-blur-md text-white rounded-full p-3.5"><ChevronLeftIcon className="w-5 h-5" /></button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{plan.name}</h1>
                <p className="text-zinc-300">{`Ex ${currentExerciseIndex + 1}/${exercises.length}: ${currentExercise?.name || ''}`}</p>
              </div>
              <button onClick={() => { }} className="text-zinc-300 hover:text-white"><InformationCircleIcon className="w-7 h-7" /></button>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-zinc-900/50 backdrop-blur-md text-white rounded-full px-4 py-2 font-bold text-lg">{formatTime(totalElapsedTime)}</div>
              <button onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })} className="bg-zinc-900/50 backdrop-blur-md text-white rounded-full p-4"><PauseIcon /></button>
            </div>
          </div>
        </div>

        {initialCountdown !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 backdrop-blur-md z-30">
            <p className="text-2xl mb-4">Get Ready!</p>
            <p className="text-9xl font-black animate-ping">{initialCountdown}</p>
          </div>
        )}

        {phase === 'resting' && restCountdown !== null && (
          <RestScreen
            countdown={restCountdown}
            nextExerciseName={currentSet < totalSets ? currentExercise.name : exercises[currentExerciseIndex + 1]?.name || "Workout Finished"}
            nextSet={currentSet < totalSets ? currentSet + 1 : 1}
            totalSets={currentSet < totalSets ? totalSets : exercises[currentExerciseIndex + 1]?.sets || 0}
          />
        )}

        {phase === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 backdrop-blur-md z-30">
            <p className="text-6xl font-black">PAUSED</p>
            <button onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })} className="mt-6 bg-lime-300 text-black text-xl font-bold rounded-full px-8 py-4">RESUME</button>
          </div>
        )}

        {phase === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-10">
            <h1 className="text-2xl font-bold text-white absolute top-20">{plan.name}</h1>
            <button onClick={() => { dispatch({ type: 'START_REQUEST' }); startCamera(); }} className="bg-lime-300 text-black text-2xl font-bold rounded-full px-12 py-6">START</button>
          </div>
        )}

        {(phase === 'starting' || phase === 'error' || cameraError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 backdrop-blur-md z-30">
            {cameraError || errorMessage ? (
              <div className="text-center">
                <p className="mt-4 text-lg font-semibold text-red-400">Error</p>
                <p className="text-sm text-red-300 max-w-sm text-center mt-2">{cameraError || errorMessage}</p>
                <button onClick={() => dispatch({ type: 'RESET', payload: currentExercise })} className="mt-4 flex items-center gap-2 bg-lime-300 hover:bg-lime-400 text-black font-bold py-2 px-4 rounded-full transition-colors"><RetryIcon /> Retry</button>
              </div>
            ) : (
              <><LoadingIcon /><p className="mt-4 text-lg font-semibold">Initializing Camera...</p></>
            )}
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 p-6 z-10 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
          <div className="bg-black/30 backdrop-blur-sm border border-zinc-700 rounded-2xl p-4 min-h-[96px] flex items-center justify-center">
            <div className="text-center">
              <p className="font-bold text-lime-300 block text-sm mb-1 uppercase tracking-wider">{backendData.status}</p>
              <p className="text-zinc-300">AI Trainer is analyzing your form.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center text-white my-4">
            <div className="flex flex-row justify-center items-center w-full mt-2 gap-8 sm:gap-12">
              <CircularProgress
                progress={isFinite(repProgress) ? repProgress : 0}
                label={isTimedExercise ? 'Seconds' : 'Reps'}
                value={isTimedExercise ? backendData.count : backendData.count}
                size={110}
                strokeWidth={10}
              />
              <CircularProgress
                progress={isFinite(setProgress) ? setProgress : 0}
                label="Sets"
                value={`${currentSet}/${totalSets}`}
                size={110}
                strokeWidth={10}
                primaryColor="#c084fc"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleFinishSet}
              disabled={phase !== 'exercising'}
              className="bg-lime-300 text-black font-bold rounded-full py-4 w-48 text-center flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            >
              <CheckIcon />
              <span>Finish Set</span>
            </button>
          </div>
        </div>
      </div>
    );
  };



  export default WorkoutTracker;
