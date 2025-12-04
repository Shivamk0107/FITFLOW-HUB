import React, { useEffect, useState } from 'react';
import { Landmarks } from '../types';

interface PoseOverlayProps {
    landmarks?: Landmarks;
    videoRef: React.RefObject<HTMLVideoElement>;
}

const CONNECTIONS = [
    ['leftShoulder', 'leftElbow'],
    ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'],
    ['rightElbow', 'rightWrist'],
    ['leftShoulder', 'rightShoulder'],
    ['leftHip', 'rightHip'],
    ['leftShoulder', 'leftHip'],
    ['rightShoulder', 'rightHip'],
    ['leftHip', 'leftKnee'],
    ['leftKnee', 'leftAnkle'],
    ['rightHip', 'rightKnee'],
    ['rightKnee', 'rightAnkle'],
];

const PoseOverlay: React.FC<PoseOverlayProps> = ({ landmarks, videoRef }) => {
    const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const updateDimensions = () => {
                setVideoDimensions({
                    width: video.clientWidth,
                    height: video.clientHeight,
                });
            };

            video.addEventListener('loadedmetadata', updateDimensions);
            window.addEventListener('resize', updateDimensions);
            updateDimensions(); // Initial call

            return () => {
                video.removeEventListener('loadedmetadata', updateDimensions);
                window.removeEventListener('resize', updateDimensions);
            };
        }
    }, [videoRef]);

    if (!landmarks || videoDimensions.width === 0) {
        return null;
    }
    
    // Scale normalized landmarks to video dimensions
    const scaledLandmarks: { [key: string]: { x: number, y: number } } = {};
    for (const key in landmarks) {
        scaledLandmarks[key] = {
            x: landmarks[key].x * videoDimensions.width,
            y: landmarks[key].y * videoDimensions.height,
        };
    }

    return (
        <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 transform scaleX(-1)"
            viewBox={`0 0 ${videoDimensions.width} ${videoDimensions.height}`}
        >
            {/* Draw connections */}
            {CONNECTIONS.map(([start, end], i) => {
                const startPoint = scaledLandmarks[start];
                const endPoint = scaledLandmarks[end];
                if (startPoint && endPoint) {
                    return (
                        <line
                            key={i}
                            x1={startPoint.x}
                            y1={startPoint.y}
                            x2={endPoint.x}
                            y2={endPoint.y}
                            stroke="#a3e635" // lime-300
                            strokeWidth="4"
                            strokeLinecap="round"
                            opacity="0.8"
                        />
                    );
                }
                return null;
            })}

            {/* Draw landmarks */}
            {Object.values(scaledLandmarks).map((point, i) => (
                <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill="#a3e635"
                    stroke="#ffffff"
                    strokeWidth="2"
                    opacity="0.9"
                />
            ))}
        </svg>
    );
};

export default PoseOverlay;