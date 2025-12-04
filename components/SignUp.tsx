import React, { useState, useRef } from 'react';
import { FitFlowLogo, UploadIcon, EyeIcon, CameraIcon, LoadingIcon } from './icons/ControlIcons';
import CameraModal from './CameraModal';
import { UserProfile } from '../types';
import { recognizeUser } from '../services/geminiService';


interface SignUpProps {
    onSignUp: (user: UserProfile) => void;
    onNavigateToLogin: () => void;
}

const DEFAULT_AVATAR = "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onNavigateToLogin }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showCameraModal, setShowCameraModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [fitnessLevel, setFitnessLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const genderOptions = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
    const fitnessLevelOptions = ['Beginner', 'Intermediate', 'Advanced'];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result as string); };
            reader.readAsDataURL(file);
        }
    };

    

const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
        setError("Full Name, Email, and Password are required.");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
        // 🔹 1. Attempt registration
        const registerResponse = await fetch("http://127.0.0.1:8000/user/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName,
                email,
                password,
                photo: imagePreview || DEFAULT_AVATAR,
                gender,
                height,
                weight,
                fitnessLevel,
            }),
        });

        const registerData = await registerResponse.json();

        // 🔸 2. If user already exists → perform AI face verification instead of error
        if (registerResponse.status === 400 && registerData.detail === "User already exists") {
            await verifyExistingUserByFace();
            return;
        }

        if (!registerResponse.ok) {
            throw new Error(registerData.detail || "Failed to register user");
        }

        // ✅ New user success → login directly
        const loginResponse = await fetch("http://127.0.0.1:8000/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();
        if (!loginResponse.ok) throw new Error(loginData.detail || "Login failed after registration");

        if (loginData.token) localStorage.setItem("fitflow_token", loginData.token);
        if (loginData.user) localStorage.setItem("fitflow_user", JSON.stringify(loginData.user));
        else localStorage.setItem("fitflow_user", JSON.stringify(loginData));

        localStorage.setItem("fitflow_user", JSON.stringify(loginData.user || loginData));
        if (loginData.token) localStorage.setItem("fitflow_token", loginData.token);
        onSignUp(loginData.user || loginData);

    } catch (err: any) {
        setError(err.message || "An error occurred during sign up.");
    } finally {
        setIsSubmitting(false);
    }
};

const verifyExistingUserByFace = async () => {
    try {
        // 🔹 1. Get user info by email
        const userRes = await fetch(`http://127.0.0.1:8000/user/by-email/${email}`);
        if (!userRes.ok) throw new Error("User not found");

        const userData = await userRes.json();
        const storedPhoto = userData.photo;

        // 🔹 2. Compare with live photo using Gemini
        const result = await recognizeUser(storedPhoto, imagePreview || "");

        console.log("Face match result:", result);

        if (result.match && result.confidence >= 0.85) {
            // ✅ Auto login success
            const loginResponse = await fetch("http://127.0.0.1:8000/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const loginData = await loginResponse.json();
            if (!loginResponse.ok) throw new Error(loginData.detail || "Login failed after verification");

            // ✅ Save token and user to localStorage after face verification login
            if (loginData.token) localStorage.setItem("fitflow_token", loginData.token);
            if (loginData.user) localStorage.setItem("fitflow_user", JSON.stringify(loginData.user));
            else localStorage.setItem("fitflow_user", JSON.stringify(loginData));

            localStorage.setItem("fitflow_user", JSON.stringify(loginData.user || loginData));
            if (loginData.token) localStorage.setItem("fitflow_token", loginData.token);
            onSignUp(loginData.user || loginData);
        } else {
            throw new Error("Face verification failed. Please try again.");
        }
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Face verification failed.");
    }
};


    return (
        <>
            {showCameraModal && (
                <CameraModal
                    onClose={() => setShowCameraModal(false)}
                    onCapture={(img) => { setImagePreview(img); setShowCameraModal(false); }}
                />
            )}
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-4">
                <div className="w-full max-w-md mx-auto">
                    <div className="text-center mb-6">
                        <FitFlowLogo className="h-14 mx-auto mb-6" lightText />
                        <h2 className="text-2xl sm:text-3xl font-bold">Create Your Account</h2>
                        <p className="text-zinc-400">Join us to start your fitness journey.</p>
                    </div>
                    
                    <div className="text-center mb-6">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <div className="relative w-28 h-28 mx-auto">
                            <img src={imagePreview || DEFAULT_AVATAR} alt="Profile" className="w-full h-full rounded-3xl object-cover ring-2 ring-zinc-700" />
                            <div className="absolute bottom-0 right-0 flex items-center gap-1">
                                <button onClick={() => fileInputRef.current?.click()} className="bg-zinc-800 p-2 rounded-full text-zinc-300 hover:bg-zinc-700"><UploadIcon className="h-4 w-4" /></button>
                                <button onClick={() => setShowCameraModal(true)} className="bg-zinc-800 p-2 rounded-full text-zinc-300 hover:bg-zinc-700"><CameraIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                        <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                        <div className="relative">
                            <input type={passwordVisible ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300" />
                            <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 px-4 flex items-center text-zinc-400 hover:text-white">
                                <EyeIcon className="h-5 w-5"/>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Height</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., 5'10"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className= "w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Weight (lbs)</label>
                                <input 
                                    type="number" 
                                    placeholder="e.g., 180"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            
                             <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Gender</label>
                                <div className="relative">
                                    <select 
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 appearance-none pr-8"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a1a1aa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                    >
                                        {genderOptions.map(option => <option key={option} value={option} className="bg-zinc-800 text-white">{option}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Fitness Level</label>
                                <div className="relative">
                                    <select 
                                        value={fitnessLevel}
                                        onChange={(e) => setFitnessLevel(e.target.value as any)}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 appearance-none pr-8"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a1a1aa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                    >
                                        {fitnessLevelOptions.map(option => <option key={option} value={option} className="bg-zinc-800 text-white">{option}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        {error && <p className="text-red-400 text-sm text-center -mt-2">{error}</p>}
                        <button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-lime-300 text-black font-bold py-3 px-4 rounded-full hover:bg-lime-400 transition-colors disabled:opacity-50 flex justify-center items-center">
                            {isSubmitting ? <LoadingIcon /> : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-zinc-500 mt-6">Already have an account?{' '}
                        <button onClick={onNavigateToLogin} className="font-semibold text-lime-300 hover:underline">Sign In</button>
                    </p>
                </div>
            </div>
        </>
    );
};


export default SignUp;
