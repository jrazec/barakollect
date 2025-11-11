import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import '../assets/styles/global.css'
import logo1 from "@/assets/images/barakollect_logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { storageService } from "@/services/storageService";
import type { Location } from "@/interfaces/global";
import useNotification from '@/hooks/useNotification';
import NotificationModal from '@/components/ui/NotificationModal';
import GlassSurface from '@/components/GlassSurface';

type ProfilePayload = {
    first_name: string;
    last_name: string;
    location_id: string;
    username: string;
    location_name: string; 
};



export default function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profile, setProfile] = useState<ProfilePayload>({
        first_name: "",
        last_name: "",
        location_id: "",
        username: "",
        location_name: "",
    });
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [role, setRole] = useState<'researcher' | 'farmer'>("researcher");
    const { showError } = useNotification();

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${import.meta.env.VITE_APP_URL}/${role}/login/`, // redirect after email confirmation
                },
            });
            if (signUpError || !signUpData.user) {
                showError("Sign Up Failed", signUpError?.message || "Unable to sign up");
                setLoading(false);
                return;
            }

            const uiid = signUpData.user.id;
            const roleId = role === 'researcher' ? '2' : '3';
            const formBody = new URLSearchParams({
                uiid,
                first_name: profile.first_name,
                last_name: profile.last_name,
                location_id: profile.location_id,
                location_name: profile.location_name,
                username: profile.username,
                role_id: roleId,
            }).toString();

            const resp = await fetch(`${import.meta.env.VITE_HOST_BE}/api/users/signup/`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formBody,
            });
            const result = await resp.json();
            if (!resp.ok) {
                showError("Failed to save profile", result.error || "Unknown error");
                setLoading(false);
                return;
            }

            // Expect backend to return role or fallback to selected
            const resolvedRole = (result.role || role).toLowerCase();
            navigate(`/${resolvedRole}/dashboard`);
        } catch (err) {
            showError("Network error", err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const resp = await storageService.getLocationForSignup();
                setLocations(resp);
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        }
        fetchLocations();
    }, []);

    return (
        <div className="login-bg min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                

                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 login-form">
            
                    {/* barakollect */}
                    <div className="text-center mb-6 border-b border-gray-300 pb-2">
                        <div className="inline-flex items-center justify-center">
                            <img 
                                src={logo1} 
                                alt="BaraKollect Logo" 
                                className="h-fit w-40"
                            />
                        </div>
                    </div>
                
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold">Create your account</h2>
                            <p className="text-sm text-gray-600">Fill in your details and select your role.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="formFloatingLbl">
                                <input type="text" name="first_name" id="first_name" value={profile.first_name} onChange={handleProfileChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200" placeholder="" />
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">First name</label>
                            </div>
                            <div className="formFloatingLbl">
                                <input type="text" name="last_name" id="last_name" value={profile.last_name} onChange={handleProfileChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200" placeholder="" />
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
                            </div>
                            <div className="formFloatingLbl md:col-span-2">
                                <select 
                                    name="location_id" 
                                    id="location" 
                                    value={profile.location_id} 
                                    onChange={(e) => {
                                        const selectedOption = e.target.selectedOptions[0];
                                        setProfile(prev => ({
                                            ...prev,
                                            location_id: e.target.value,
                                            location_name: selectedOption.text
                                        }));
                                    }} 
                                    required 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200"
                                >
                                    <option value="">Select a location</option>
                                    {/* Add your location options here */}
                                    {locations.map(location => (
                                        <option key={location.id} value={location.id}>{location.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="formFloatingLbl md:col-span-2">
                                <input type="text" name="username" id="username" value={profile.username} onChange={handleProfileChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200" placeholder="" />
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="formFloatingLbl">
                                <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200" placeholder="" />
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            </div>
                            <div className="formFloatingLbl">
                                <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200" placeholder="" />
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Select your role</p>
                            <div className="flex items-center gap-6">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="role" value="researcher" checked={role === 'researcher'} onChange={() => setRole('researcher')} />
                                    <span>Researcher</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="role" value="farmer" checked={role === 'farmer'} onChange={() => setRole('farmer')} />
                                    <span>Farmer</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:ring-offset-2">
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-gray-600 text-sm">Already have an account? </span>
                        <Link to="/login" className="text-barako hover:text-[var(--arabica-brown)] font-medium transition-colors duration-300">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}


