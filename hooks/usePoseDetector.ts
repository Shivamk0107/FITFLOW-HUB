// FIX: Import React to use React.RefObject
import React, { useEffect, useState, useRef } from 'react';
import { PoseLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Landmarks, LandmarkName } from '../types';

// Mapping from MediaPipe pose landmark indices to our app's landmark names
const POSE_LANDMARKS_MAP: Record<number, LandmarkName> = {
  11: 'leftShoulder',
  13: 'leftElbow',
  15: 'leftWrist',
  12: 'rightShoulder',
  14: 'rightElbow',
  16: 'rightWrist',
  23: 'leftHip',
  25: 'leftKnee',
  27: 'leftAnkle',
  24: 'rightHip',
  26: 'rightKnee',
  28: 'rightAnkle',
};

export const usePoseDetector = (
  videoRef: React.RefObject<HTMLVideoElement>,
  onLandmarks: (landmarks: Landmarks) => void
) => {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isDetectorReady, setIsDetectorReady] = useState(false);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        setPoseLandmarker(landmarker);
        setIsDetectorReady(true);
      } catch (error) {
        console.error("Error initializing PoseLandmarker:", error);
      }
    };
    createPoseLandmarker();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      poseLandmarker?.close();
    };
  }, [poseLandmarker]);

  const predictWebcam = () => {
    if (!videoRef.current || !poseLandmarker) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const startTimeMs = performance.now();
    const results = poseLandmarker.detectForVideo(video, startTimeMs);

    if (results.landmarks && results.landmarks.length > 0) {
      const detectedLandmarks = results.landmarks[0];
      const appLandmarks: Landmarks = {};

      detectedLandmarks.forEach((landmark: NormalizedLandmark, index: number) => {
        const landmarkName = POSE_LANDMARKS_MAP[index];
        if (landmarkName && (landmark.visibility === undefined || (landmark.visibility && landmark.visibility > 0.5))) {
          appLandmarks[landmarkName] = { x: landmark.x, y: landmark.y };
        }
      });
      onLandmarks(appLandmarks);
    }
    
    animationFrameId.current = requestAnimationFrame(predictWebcam);
  };

  const startDetection = () => {
    if (isDetectorReady && !animationFrameId.current) {
        predictWebcam();
    }
  };

  const stopDetection = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  };

  return { isDetectorReady, startDetection, stopDetection };
};
