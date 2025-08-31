import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import '../assets/styles/global.css'

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [stage, setStage] = useState<'loading' | 'ready' | 'done' | 'error'>("loading");
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const prepare = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    setStage("ready");
                    return;
                }
                // Supabase handles the hash exchange internally when detectSessionInUrl is true
                // Give it a moment to process, then check again
                setTimeout(async () => {
                    const { data: d2 } = await supabase.auth.getSession();
                    setStage(d2.session ? "ready" : "error");
                }, 500);
            } catch {
                setStage("error");
            }
        };
        prepare();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setMessage("Password must be at least 6 characters");
            return;
        }
        if (password !== confirm) {
            setMessage("Passwords do not match");
            return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            setMessage(error.message);
            return;
        }
        setStage("done");
    };

    if (stage === "loading") return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                {stage === 'ready' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h1 className="text-xl font-semibold">Set a new password</h1>
                            <p className="text-sm text-gray-600">Enter and confirm your new password.</p>
                        </div>
                        <div className="formFloatingLbl">
                            <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200" placeholder="" />
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                        </div>
                        <div className="formFloatingLbl">
                            <input type="password" id="confirm" name="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-barako-light focus:border-barako-light transition-colors duration-200" placeholder="" />
                            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                        </div>
                        {message && <p className="text-sm text-red-600">{message}</p>}
                        <button type="submit" className="w-full !bg-black text-white py-3 px-4 rounded-lg font-medium">Update password</button>
                    </form>
                )}
                {stage === 'done' && (
                    <div className="text-center space-y-4">
                        <h1 className="text-xl font-semibold">Password updated</h1>
                        <p className="text-gray-600">Your password has been updated. You can now log in.</p>
                        <a href="/login" className="inline-block !bg-black text-white px-4 py-2 rounded-md">Back to login</a>
                    </div>
                )}
                {stage === 'error' && (
                    <div className="text-center space-y-4">
                        <h1 className="text-xl font-semibold">Link invalid or expired</h1>
                        <p className="text-gray-600">Please request a new password reset link.</p>
                        <a href="/login" className="inline-block !bg-black text-white px-4 py-2 rounded-md">Back to login</a>
                    </div>
                )}
            </div>
        </div>
    );
}


