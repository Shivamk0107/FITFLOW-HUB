import React from 'react';

export const ArrowLeftIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export const StartIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const StopIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
    </svg>
);

export const PauseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
    </svg>
);


export const BellIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 14.36V11c0-3.87-3.13-7-7-7S5 7.13 5 11v3.36L3.21 17.8c-.41.73.08 1.7 1.01 1.7h15.56c.93 0 1.42-.97 1.01-1.7L19 14.36zM12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/>
    </svg>
);

export const CameraIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

export const LoadingIcon: React.FC = () => (
    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const RetryIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.695v.001" />
    </svg>
);

export const CameraOffIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5l-3 3m0 0l-3-3m3 3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 9v6a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 15V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44zM3 3l18 18" />
    </svg>
);

export const LogoutIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export const FitFlowLogo: React.FC<{className?: string, lightText?: boolean}> = ({ className, lightText = false }) => {
    const textColor = lightText ? "#FFFFFF" : "#111827";
    return (
        <div className={`flex items-center justify-center gap-4 ${className}`}>
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill={textColor}>
                 <path d="M3 10H5V14H3V10M19 10H21V14H19V10M6 8V16H9V8H6M15 8V16H18V8H15M10 7H14V17H10V7Z" />
            </svg>
            <span
                style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '36px',
                    fontWeight: 700,
                    color: textColor,
                }}
            >
                FitFlow Hub
            </span>
        </div>
    );
};

export const ChevronLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

export const ChevronRightIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

export const FireIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM10 18a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM6 6a1 1 0 001-1V4a1 1 0 10-2 0v1a1 1 0 001 1z" clipRule="evenodd" />
    </svg>
);

export const ChartIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? "h-7 w-7"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3,13H5V18H3M7,8H9V18H7M11,12H13V18H11M15,5H17V18H15M19,10H21V18H19V10Z" />
    </svg>
);

export const UploadIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const EyeIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export const CaptureIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const TrashIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const CloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const CheckIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export const DumbbellIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? "h-6 w-6"} viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
    </svg>
);

export const InformationCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const DiceIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? "w-6 h-6"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M7,7A1,1 0 0,0 6,8A1,1 0 0,0 7,9A1,1 0 0,0 8,8A1,1 0 0,0 7,7M17,7A1,1 0 0,0 16,8A1,1 0 0,0 17,9A1,1 0 0,0 18,8A1,1 0 0,0 17,7M7,15A1,1 0 0,0 6,16A1,1 0 0,0 7,17A1,1 0 0,0 8,16A1,1 0 0,0 7,15M17,15A1,1 0 0,0 16,16A1,1 0 0,0 17,17A1,1 0 0,0 18,16A1,1 0 0,0 17,15M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11Z" />
    </svg>
);

// --- ICONS FOR NEW LARGE NAV ---

export const NavHomeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.099l-9 7.9v10h6v-6h6v6h6v-10l-9-7.9z" />
    </svg>
);

export const OldSettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.43,12.98C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.98L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.98M12,15C10.34,15 9,13.66 9,12C9,10.34 10.34,9 12,9C13.66,9 15,10.34 15,12C15,13.66 13.66,15 12,15Z" />
    </svg>
);

export const TrendingUpIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className ?? "w-full h-full"} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
    </svg>
);


export const NavPlanIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L15.57 17L12 13.43L8.43 17L7 15.57L10.57 12L9.14 10.57L7.71 12L4.83 9.14L9.14 4.83L12 7.71L14.86 4.83L19.17 9.14L17.74 10.57L13.43 12L17 15.57Z" />
    </svg>
);

export const NavProgressIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5 5.5C13.5 4.67 12.83 4 12 4C11.17 4 10.5 4.67 10.5 5.5C10.5 6.33 11.17 7 12 7C12.83 7 13.5 6.33 13.5 5.5M9.89 19.38L10.89 15.15L9 14.58V12.5H15V14.58L13.11 15.15L14.11 19.38H9.89M15 11L14.43 8.25L12.5 9.14L12 11H15Z" />
    </svg>
);

export const NavSettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.44 12.99L19.94 15.06L18.19 16.03L17.69 18.1L15.62 18.6L14.65 20.35L12.58 19.85L10.5 20.35L9.53 18.6L7.46 18.1L6.96 16.03L5.21 15.06L5.71 12.99L4.94 11L5.71 9.01L5.21 6.94L6.96 5.97L7.46 3.9L9.53 3.4L10.5 1.65L12.58 2.15L14.65 1.65L15.62 3.4L17.69 3.9L18.19 5.97L19.94 6.94L19.44 9.01L20.21 11L19.44 12.99M12 8C9.79 8 8 9.79 8 12S9.79 16 12 16 16 14.21 16 12 14.21 8 12 8Z" />
    </svg>
);

// --- Progress Dashboard Icons ---
export const WalkingIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.5,4.08L16.5,6.08L18.5,4.08L19.91,5.5L17.91,7.5L19.91,9.5L18.5,10.91L16.5,8.91L14.5,10.91L13.08,9.5L15.08,7.5L13.08,5.5L14.5,4.08M14.12,12.08L11.91,14.29L12.58,21H10.58L9.91,14.91L6.33,18.5L4.91,17.08L8.83,13.16L5.25,9.58L6.66,8.16L10.25,11.75L12.04,10L14.12,12.08Z" />
    </svg>
);

export const CyclingIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M15.58,11.81L18.25,16H15.5L14,14.5L11.5,17L9.5,15L6.25,18.25L5.75,17.75L9,14.5L11,16.5L13.5,14L14.04,12.25L12,11L11.45,9H9.5V7H12.25L13.56,9.53L15.58,11.81M6,20A2,2 0 0,0 4,22A2,2 0 0,0 6,24A2,2 0 0,0 8,22A2,2 0 0,0 6,20M18,20A2,2 0 0,0 16,22A2,2 0 0,0 18,24A2,2 0 0,0 20,22A2,2 0 0,0 18,20Z" />
    </svg>
);

export const MeditationIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A9,9 0 0,1 21,11C21,14.04 19.44,16.63 17.2,18.32L15.74,16.86C17.41,15.56 18.5,13.43 18.5,11A6.5,6.5 0 0,0 12,4.5A6.5,6.5 0 0,0 5.5,11C5.5,13.43 6.59,15.56 8.26,16.86L6.8,18.32C4.56,16.63 3,14.04 3,11A9,9 0 0,1 12,2M12,9.5A1.5,1.5 0 0,1 13.5,11A1.5,1.5 0 0,1 12,12.5A1.5,1.5 0 0,1 10.5,11A1.5,1.5 0 0,1 12,9.5M4.93,19.5L7.05,17.38L9.17,19.5L10.59,18.09L8.46,15.96L10.59,13.84L9.17,12.42L7.05,14.54L4.93,12.42L3.5,13.84L5.63,15.96L3.5,18.09L4.93,19.5M19.07,19.5L20.5,18.09L18.37,15.96L20.5,13.84L19.07,12.42L16.95,14.54L14.83,12.42L13.41,13.84L15.54,15.96L13.41,18.09L14.83,19.5L16.95,17.38L19.07,19.5Z" />
    </svg>
);

export const TrophyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19,3H5A2,2 0 0,0 3,5V6A2,2 0 0,0 5,8H6V14A2,2 0 0,0 8,16H9V19A3,3 0 0,0 12,22A3,3 0 0,0 15,19V16H16A2,2 0 0,0 18,14V8H19A2,2 0 0,0 21,6V5A2,2 0 0,0 19,3M5,6H5.03L5,6.03V5.97L5.03,6H5M19,6V6.03L18.97,6H19M16,14H8V8H16V14Z" />
    </svg>
);

export const TargetIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,20.5C16.69,20.5 20.5,16.69 20.5,12C20.5,7.31 16.69,3.5 12,3.5C7.31,3.5 3.5,7.31 3.5,12C3.5,16.69 7.31,20.5 12,20.5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
    </svg>
);

// FIX: Update FlameIcon to accept a style prop for dynamic sizing.
export const FlameIcon: React.FC<{className?: string; style?: React.CSSProperties}> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2C12,2 5,8 5,14C5,17.31 7.69,20 11,20C11,21.1 11.9,22 13,22C14.1,22 15,21.1 15,20C18.31,20 21,17.31 21,14C21,8 14,2 14,2" />
    </svg>
);