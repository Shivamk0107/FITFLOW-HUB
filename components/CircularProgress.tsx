import React from 'react';

interface CircularProgressProps {
  progress: number; // A value between 0 and 100
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  label: string;
  value: string | number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  primaryColor = '#a3e635', // lime-300
  secondaryColor = '#3f3f46', // zinc-700
  label,
  value,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="transition-colors duration-300"
          stroke={secondaryColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="transition-all duration-500 ease-out"
          stroke={primaryColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="text-center">
        <p className="text-3xl font-black text-white">{value}</p>
        <p className="text-xs text-zinc-400 font-semibold uppercase -mt-1">{label}</p>
      </div>
    </div>
  );
};

export default CircularProgress;
