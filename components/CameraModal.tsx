import React, { useRef, useEffect } from 'react';
import { CloseIcon, CameraOffIcon, LoadingIcon, RetryIcon, CaptureIcon } from './icons/ControlIcons';
import { useCamera } from '../hooks/useCamera';

interface CameraModalProps {
    onClose: () => void;
    onCapture: (image: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture }) => {
    const { videoRef, startCamera, stopCamera, isCameraReady, error } = useCamera();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // ✅ Start camera on mount, stop on unmount
    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ Ensures camera stops immediately when modal is closed
    const handleClose = () => {
        stopCamera();
        onClose();
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current && isCameraReady) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');

            if (context) {
                // Flip the image horizontally (mirrored selfie)
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                stopCamera(); // ✅ Stop stream after capture
                onCapture(dataUrl);
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative max-w-2xl w-full">
                {/* ✅ Modified Close Button */}
                <button onClick={handleClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                    <CloseIcon />
                </button>

                <h3 className="text-xl font-bold mb-4 text-center text-white">Take a Picture</h3>

                <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden">
                    <video ref={videoRef} playsInline muted className="w-full h-full object-cover transform scaleX(-1)" />
                    <canvas ref={canvasRef} className="hidden"></canvas>

                    {(!isCameraReady || error) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                            {error ? (
                                <div className="text-center p-4">
                                    <CameraOffIcon className="h-12 w-12 text-red-400 mx-auto" />
                                    <p className="mt-2 font-semibold text-red-300">Camera Error</p>
                                    <p className="text-xs text-zinc-400 mt-1 max-w-xs">{error}</p>
                                    <button
                                        onClick={() => {
                                            stopCamera();
                                            startCamera();
                                        }}
                                        className="mt-4 flex items-center mx-auto gap-2 bg-lime-300 text-black font-bold py-2 px-4 rounded-full"
                                    >
                                        <RetryIcon /> Retry
                                    </button>
                                </div>
                            ) : (
                                <LoadingIcon />
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-center">
                    <button
                        onClick={handleCapture}
                        disabled={!isCameraReady || !!error}
                        className="flex items-center gap-2 bg-lime-300 text-black font-bold py-3 px-6 rounded-full disabled:bg-zinc-600 disabled:cursor-not-allowed"
                    >
                        <CaptureIcon /> Capture
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraModal;
