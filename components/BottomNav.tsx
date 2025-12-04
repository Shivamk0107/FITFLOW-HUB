import React from 'react';
import { NavHomeIcon, NavPlanIcon, OldSettingsIcon, TrendingUpIcon } from './icons/ControlIcons';

type View = 'activity' | 'plan' | 'progress' | 'settings';

interface BottomNavProps {
    activeView: View;
    setView: (view: View) => void;
}

const navItems = [
    { id: 'activity', label: 'Home', icon: <NavHomeIcon /> },
    { id: 'plan', label: 'Plan', icon: <NavPlanIcon /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUpIcon className="w-full h-full" /> },
    { id: 'settings', label: 'Settings', icon: <OldSettingsIcon /> },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
    return (
        <div className="fixed bottom-4 inset-x-0 flex justify-center z-50 px-4">
            <div className="bg-zinc-900/70 backdrop-blur-xl rounded-full p-2 flex items-center gap-2 shadow-lg ring-1 ring-white/10 w-full max-w-md justify-around">
                {navItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as View)}
                            className={`flex items-center justify-center transition-all duration-300 ease-in-out rounded-full
                                ${isActive 
                                    ? 'bg-lime-300 text-zinc-900 px-6 py-4' 
                                    : 'w-14 h-14 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                }
                            `}
                            aria-label={item.label}
                        >
                            <div className="w-7 h-7 flex-shrink-0">{item.icon}</div>
                            {isActive && <span className="ml-2.5 font-bold text-base whitespace-nowrap">{item.label}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;