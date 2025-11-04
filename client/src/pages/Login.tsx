import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import '../assets/styles/global.css'
import logo1 from "@/assets/images/barakollect_logo.svg";
import logo2 from "@/assets/images/logo.svg";
import { supabase } from "@/lib/supabaseClient";
import type { LoginFormType } from "@/interfaces/global";
import { Link } from "react-router-dom";
import useNotification from '@/hooks/useNotification';
import NotificationModal from '@/components/ui/NotificationModal';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<LoginFormType>({
        email : "",
        password : "",
    });
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [showForgot, setShowForgot] = useState<boolean>(false);
    const [forgotEmail, setForgotEmail] = useState<string>("");
    const { showSuccess, showError } = useNotification();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const autoRedirectIfRemembered = async () => {
            try {
                const remembered = localStorage.getItem("bk_remember_me") === "true";
                if (!remembered) return;
                const { data } = await supabase.auth.getSession();
                const uiid = data.session?.user?.id;
                if (!uiid) return;
                const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/users/login/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ uiid }).toString(),
                });
                const result = await response.json();
                if (!response.ok) return;
                const user = result.data && result.data[0];
                const role = user && user["userrole__role__name"] ? user["userrole__role__name"].toLowerCase() : "";
                if (role) window.location.href = `/${role}/dashboard`;
            } catch {}
        };
        autoRedirectIfRemembered();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        const {data, error} = await supabase.auth.signInWithPassword(formData);
        if(error) {
            showError("Login Failed", error.message);
        } else {
           localStorage.setItem("bk_remember_me", rememberMe ? "true" : "false");
           // Example fetch template for calling your Django backend after successful Supabase login
           // (Replace the URL and payload as needed for your actual API)
           try {
               const response = await fetch(`${import.meta.env.VITE_HOST_BE}/api/users/login/`, {
                   method: "POST",
                   headers: {
                       "Content-Type": "application/x-www-form-urlencoded",
                   },
                   body: new URLSearchParams({
                       uiid: data.user?.id || "",
                   }).toString(),
               });
               const result = await response.json();
               if (!response.ok) {
                   showError("Failed to fetch user data", result.error || "Unknown error");
               } else {
                   const user = result.data && result.data[0];
                   if (user && user["userrole__role__name"]) {
                       const role = user["userrole__role__name"].toLowerCase();
                       window.location.href = `/${role}/dashboard`;
                   } else {
                       showError("User role not found", "Cannot redirect.");
                   }
               }
           } catch (err) {
               showError("Network error", err instanceof Error ? err.message : "Unknown error");
           }
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail) return;
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) {
            showError("Password reset failed", error.message);
            return;
        }
        showSuccess("Password reset email sent", "Please check your inbox.");
        setShowForgot(false);
        setForgotEmail("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* barakollect */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-6">
                        <img 
                            src={logo1} 
                            alt="BaraKollect Logo" 
                            className="h-16 w-auto"
                        />
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg shadow-2xl p-8 border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* email Field */}
                        <div className="formFloatingLbl">
                            <input
                                type="text"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200"
                                placeholder=""
                            />
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                        </div>

                        {/* Password Field */}
                        <div className="formFloatingLbl">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200"
                                    placeholder=""
                                />
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="!bg-black absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 checked:bg-[var(--arabica-brown)] !checked:text-white border-gray-300 rounded cursor-pointer"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <button type="button" onClick={() => setShowForgot(true)} className="button-secondary text-sm text-barako !hover:text-[var(--barako-light)] !hover:bg-[var(--mocha)] font-medium">
                                Forgot password?
                            </button>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full !bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-barako focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            Log In
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                            </div>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <Link to="/signup" className="text-barako hover:text-barako-light font-medium">
                            Create a new account
                        </Link>
                    </div>
                </div>
            </div>

            {showForgot && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">Reset your password</h3>
                            <p className="text-sm text-gray-600">Enter your email and we will send you a password reset link.</p>
                        </div>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="formFloatingLbl">
                                <input
                                    type="email"
                                    id="forgot-email"
                                    name="forgot-email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200"
                                    placeholder=""
                                />
                                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button type="button" onClick={() => setShowForgot(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-md !bg-black text-white">Send reset link</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}