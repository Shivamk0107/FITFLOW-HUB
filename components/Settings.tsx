import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, ChevronRightIcon, TrendingUpIcon, LoadingIcon, LogoutIcon, CameraIcon, CheckIcon } from './icons/ControlIcons';
import { UserProfile } from '../types';
import * as db from '../services/db';
import CameraModal from './CameraModal';
import { uploadImageToFirebase } from "../services/uploadImage";

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 border-b border-zinc-800">
        <label className="text-zinc-400 text-lg mb-2 sm:mb-0">{label}</label>
        <div className="w-full sm:w-auto flex items-center gap-2 text-white text-lg font-semibold">
            {children}
        </div>
    </div>
);

interface SettingsProps {
    user: UserProfile;
    onUpdate: (user: UserProfile) => void;
    onLogout: () => void;
}

const fitnessLevelDetails = {
    Beginner: {
        description: "Just starting out or getting back into fitness.",
        image: "https://images.pexels.com/photos/3757374/pexels-photo-3757374.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    Intermediate: {
        description: "Comfortable with most exercises and workout routines.",
        image: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    Advanced: {
        description: "Experienced and ready for high-intensity challenges.",
        image: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
};




const Settings: React.FC<SettingsProps> = ({ user, onUpdate, onLogout }) => {
    const [profile, setProfile] = useState<UserProfile>(user);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [showCameraModal, setShowCameraModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [expandedLevel, setExpandedLevel] = useState<UserProfile['fitnessLevel'] | null>(user.fitnessLevel);

    useEffect(() => {
        setProfile(user);
    }, [user]);

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(p => ({ ...p, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const url = await uploadImageToFirebase(file, user._id);
            console.log("Image uploaded:", url);
            setProfile(p => ({ ...p, photo: url }));
            await db.updateUser({ ...profile, photo: url });
        } catch (error) {
            console.error("Upload failed", error);
        }
    };
    const handleInputChange = (field: keyof UserProfile, value: string | number) => {
        setProfile(p => ({ ...p, [field]: value }));
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            const updatedUser = await db.updateUser(profile);
            onUpdate(updatedUser);
            setSaveMessage('Changes saved successfully!');
        } catch (error) {
            setSaveMessage('Failed to save changes.');
            console.error(error);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'] as const;
    const genderOptions = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];

    const inputStyles = "bg-zinc-800 sm:bg-transparent text-left sm:text-right w-full focus:outline-none p-2 sm:p-0 rounded-md sm:rounded-none";

    return (
        <>
        {showCameraModal && <CameraModal 
            onClose={() => setShowCameraModal(false)} 
            onCapture={(img) => { 
                setProfile(p => ({ ...p, photo: img })); 
                setShowCameraModal(false); 
            }} 
        />}
        <div className="pb-28">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8">Settings</h1>
            
            <div className="flex flex-col items-center mb-10">
                <div className="relative w-32 h-32">
                    <img src={profile.photo} alt="Profile" className="w-full h-full rounded-3xl object-cover ring-4 ring-zinc-800" />
                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                    <div className="absolute bottom-1 right-1 flex items-center gap-2">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-purple-500 text-white p-3 rounded-full hover:bg-purple-600 transition-colors shadow-lg"
                            aria-label="Upload new photo"
                        >
                            <UploadIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setShowCameraModal(true)}
                            className="bg-purple-500 text-white p-3 rounded-full hover:bg-purple-600 transition-colors shadow-lg"
                            aria-label="Take new photo"
                        >
                            <CameraIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Basic Information</h2>
                <FormRow label="Name">
                    <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`${inputStyles} sm:w-48`}
                    />
                </FormRow>
                <FormRow label="Age">
                     <input
                        type="number"
                        value={profile.age}
                        onChange={(e) => handleInputChange('age', Number(e.target.value))}
                        className={`${inputStyles} sm:w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    />
                </FormRow>
                 <FormRow label="Gender Identity">
                     <select 
                        value={profile.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className={`${inputStyles} appearance-none pr-6`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2371717a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        {genderOptions.map(option => <option key={option} value={option} className="bg-zinc-800 text-white">{option}</option>)}
                    </select>
                </FormRow>
                <FormRow label="Height">
                    <input
                        type="text"
                        value={profile.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        className={`${inputStyles} sm:w-24`}
                    />
                </FormRow>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4">
                    <label className="text-zinc-400 text-lg mb-2 sm:mb-0">Weight</label>
                    <div className="w-full sm:w-auto flex items-center gap-4 text-white text-lg font-semibold">
                         <input
                            type="number"
                            value={profile.weight}
                            onChange={(e) => handleInputChange('weight', e.target.value)}
                            className={`${inputStyles} sm:w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        />
                        <span className="text-zinc-400">lbs</span>
                        <button className="text-purple-400 flex items-center gap-1 text-base ml-auto sm:ml-0">
                            <TrendingUpIcon className="w-5 h-5"/>
                            History
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-zinc-900 rounded-3xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Fitness Background</h2>
                <div className="flex flex-col gap-4">
                    {fitnessLevels.map(level => {
                        const isExpanded = expandedLevel === level;
                        const isActive = profile.fitnessLevel === level;
                        const details = fitnessLevelDetails[level];
                        return (
                            <div key={level} className="bg-zinc-800 rounded-[2rem] overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => setExpandedLevel(isExpanded ? null : level)}
                                    className="w-full p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-left"
                                    aria-expanded={isExpanded}
                                >
                                    <img src={details.image} alt={level} className="h-24 w-full sm:w-24 rounded-3xl object-cover flex-shrink-0" />
                                    <div className="flex-grow w-full mt-4 sm:mt-0 flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-xl sm:text-2xl text-white">{level}</h3>
                                            {isActive && (
                                                <div className="mt-1 flex items-center gap-1.5 text-lime-300 font-semibold text-base">
                                                    <CheckIcon className="w-5 h-5" />
                                                    <span>Current Level</span>
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRightIcon className={`w-6 h-6 text-zinc-400 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>
                                </button>
                                
                                {isExpanded && (
                                    <div className="px-5 pb-5 -mt-2">
                                        <p className="text-zinc-300 mb-4">{details.description}</p>
                                        <button
                                            onClick={() => {
                                                handleInputChange('fitnessLevel', level);
                                            }}
                                            disabled={isActive}
                                            className="w-full bg-purple-500 text-white font-bold py-3 rounded-full hover:bg-purple-600 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isActive ? 'Selected' : 'Select this Level'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {saveMessage && <p className="text-center text-lime-300 mb-4 font-semibold">{saveMessage}</p>}
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-purple-500 text-white font-bold py-4 px-4 rounded-full hover:bg-purple-600 transition-colors text-xl flex justify-center items-center disabled:opacity-50"
            >
                {isSaving ? <LoadingIcon /> : 'Save Changes'}
            </button>
            <button 
                onClick={onLogout}
                className="w-full bg-red-500/20 text-red-300 font-bold py-4 px-4 rounded-full hover:bg-red-500/30 transition-colors text-xl flex justify-center items-center gap-2 mt-4"
            >
                <LogoutIcon />
                Sign Out
            </button>
        </div>
        </>
    );
};

export default Settings;