import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    // Clear previous errors on a new attempt
    setError(null);
    if (stream) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user' 
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => {
          console.error("Video play failed:", err);
          // Autoplay can be blocked by the browser. User interaction should prevent this, but we log it just in case.
        });
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please enable camera access in your browser settings and click Retry.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please ensure a camera is connected and enabled.');
        } else {
          setError(`Error accessing camera: ${err.name}. Check your camera and browser permissions.`);
        }
      } else if (err instanceof Error) {
        setError(`An error occurred: ${err.message}. Please ensure you have granted camera permissions.`);
      } else {
        setError("An unknown error occurred while accessing the camera.");
      }
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraReady(false);
    }
  }, [stream]);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
        };
    }
  }, [stream]);

  useEffect(() => {
    const timer = setTimeout(() => startCamera(), 100);
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  return { videoRef, startCamera, stopCamera, error, isCameraReady };
};