import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import '../assets/styles/global.css'
import logo1 from "@/assets/images/barakollect_logo.svg";
import logo2 from "@/assets/images/logo.svg";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Login attempt:', formData);
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
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* username Field */}
                        <div className="formFloatingLbl">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200"
                                placeholder=""
                            />
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
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
                                    className="h-4 w-4 text-barako focus:ring-amber-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="text-sm text-barako hover:text-barako-light font-medium">
                                Forgot password?
                            </a>
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
                        <a href="#" className="text-barako hover:text-barako-light font-medium">
                            Create a new account
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}