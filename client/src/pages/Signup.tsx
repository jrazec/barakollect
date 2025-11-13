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
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
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

                        {/* Terms and Privacy Agreement */}
                        <div className="bg-[var(--fadin-mocha)] border border-[var(--fadin-mocha)] rounded-lg p-4 space-y-3">
                            <label className="flex items-start gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    required
                                    className="mt-1 w-4 h-4 text-[var(--arabica-brown)] border-gray-300 rounded focus:ring-[var(--arabica-brown)]"
                                />
                                <span className="text-sm text-gray-700">
                                    I agree to the{' '}
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowTermsModal(true);
                                        }}
                                        className="text-[var(--arabica-brown)] hover:underline font-medium"
                                    >
                                        Terms and Conditions
                                    </a>
                                </span>
                            </label>
                            <label className="flex items-start gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreedToPrivacy}
                                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                                    required
                                    className="mt-1 w-4 h-4 text-[var(--arabica-brown)] border-gray-300 rounded focus:ring-[var(--arabica-brown)]"
                                />
                                <span className="text-sm text-gray-700">
                                    I agree to the{' '}
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowPrivacyModal(true);
                                        }}
                                        className="text-[var(--arabica-brown)] hover:underline font-medium"
                                    >
                                        Privacy Policy
                                    </a>
                                </span>
                            </label>
                        </div>

                        <button type="submit" disabled={loading || !agreedToTerms || !agreedToPrivacy} className="w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[var(--arabica-brown)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-gray-600 text-sm">Already have an account? </span>
                        <Link to="/login" className="text-barako hover:text-[var(--arabica-brown)] font-medium transition-colors duration-300">Log in</Link>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900">Terms and Conditions</h2>
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="button-accent text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="prose prose-sm max-w-none">
                                <h1 className="text-xl font-bold text-gray-900 mb-4">BaraKollect Platform Terms and Conditions of Service</h1>
                                <p className="text-sm text-gray-600 mb-6"><strong>Effective Date:</strong> October 19, 2025</p>
                                
                                <p className="text-gray-700 mb-4">
                                    PLEASE READ THESE TERMS AND CONDITIONS OF SERVICE ("TERMS") CAREFULLY. BY ACCESSING OR USING THE BARAKOLLECT WEB-BASED PLATFORM ("THE SERVICE"), YOU AGREE TO BE BOUND BY THESE TERMS AND ALL POLICIES INCORPORATED HEREIN.
                                </p>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Acceptance of Terms</h2>
                                <p className="text-gray-700 mb-4">
                                    BaraKollect ("we," "us," or "our") provides this web-based platform to facilitate the monitoring and analysis of Liberica coffee bean morphology using computer vision and GIS analytics, as defined by our General and Specific Objectives. These Terms govern your access and use of the Service. If you do not agree to these Terms, you may not access or use the Service.
                                </p>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Description of Service and Objectives</h2>
                                <p className="text-gray-700 mb-3">
                                    The Service is a collaborative research and data repository tool designed to meet the following core objectives:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li><strong>Data Repository:</strong> Establish a structured digital repository for Liberica coffee bean data, including morphological features, local traits, and farm metadata (Objective 1.1, 1.2).</li>
                                    <li><strong>Morphological Analysis:</strong> Utilize computer vision techniques to identify, categorize, and classify coffee beans based on uploaded images, shape, and size features (Objective 2.1, 2.2).</li>
                                    <li><strong>Analytical Insights:</strong> Provide Users with access to an interactive dashboard for visualizing morphology, quality trends, patterns, and correlations (Objective 3.1, 3.2).</li>
                                    <li><strong>GIS Integration:</strong> Visualize and aggregate farm status and provide location-specific insights within the Batangas region (Objective 4.1, 4.2).</li>
                                </ul>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. User Roles and Responsibilities</h2>
                                <p className="text-gray-700 mb-4">
                                    Access to the Service is generally provided through two primary roles: Farmers and Researchers/Analysts.
                                </p>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">3.1 Farmer Responsibilities</h3>
                                <p className="text-gray-700 mb-3">As a Farmer, you agree to:</p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li>Provide accurate and truthful personal data (Name, Farm/Cooperative Name, Contact Information).</li>
                                    <li>Ensure the coffee bean images and farm metadata (e.g., harvest date, processing method) you upload are accurate and genuinely represent your Liberica stock.</li>
                                    <li>Provide accurate Farm Location data (GPS coordinates) necessary for the GIS feature (Objective 4.1).</li>
                                    <li>Acknowledge that uploaded data is intended for public, academic research, and quality assessment collaboration.</li>
                                </ul>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">3.2 Researcher/Analyst Responsibilities</h3>
                                <p className="text-gray-700 mb-3">As a Researcher or Analyst, you agree to:</p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li>Use the data, including Aggregated Morphological Data and Anonymous GIS data, solely for the purposes of academic research, analysis, and quality standard development as defined by the platform's objectives.</li>
                                    <li>Comply with all ethical research guidelines when accessing and utilizing the datasets.</li>
                                    <li>Acknowledge and properly attribute the BaraKollect platform and contributing Farmers (using provided non-personal identifiers) in any public presentation, publication, or academic output resulting from the use of the Service.</li>
                                </ul>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Intellectual Property and Data Ownership</h2>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">4.1 User-Contributed Content (Raw Data)</h3>
                                <p className="text-gray-700 mb-3"><strong>Image Submission and Retention:</strong></p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li>Once an image has been submitted, it cannot be deleted to ensure record accuracy and data integrity. This policy helps preserve verifiable research data and maintain consistency in the morphological database.</li>
                                    <li>If you have submitted an image by mistake, please contact your local administrator or the BaraKollect support team to request a review.</li>
                                </ul>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">4.2 Platform-Derived Content</h3>
                                <p className="text-gray-700 mb-4">
                                    <strong>Ownership:</strong> BaraKollect and its institutional partners exclusively own all rights, title, and interest in all data derived from the User-Contributed Content, including Extracted Features (shape metrics, color profiles), classification results, and aggregated trends, patterns, and correlations identified by the platform's analytical tools.
                                </p>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Disclaimers and Limitation of Liability</h2>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">5.1 No Commercial Guarantee</h3>
                                <p className="text-gray-700 mb-4">
                                    The analytical and classification results provided by the computer vision system and interactive dashboard (Objectives 2.1, 3.1) are for informational and research purposes only and are intended to assist in quality assessment. BaraKollect makes no warranties regarding the accuracy, completeness, or reliability of these results and shall not be liable for any commercial or financial losses incurred based on the use of the Service's insights.
                                </p>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">5.2 "AS IS" Basis</h3>
                                <p className="text-gray-700 mb-4">
                                    The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                                </p>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Termination and Suspension</h2>
                                <p className="text-gray-700 mb-4">
                                    We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice, for any conduct that we believe violates these Terms, is harmful to other Users, or is disruptive to the Service's operation.
                                </p>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Governing Law</h2>
                                <p className="text-gray-700">
                                    These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Batangas, Philippines.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Policy Modal */}
            {showPrivacyModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900">Privacy Policy</h2>
                            <button
                                onClick={() => setShowPrivacyModal(false)}
                                className="button-accent text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="prose prose-sm max-w-none">
                                <h1 className="text-xl font-bold text-gray-900 mb-4">BaraKollect Platform Comprehensive Privacy Policy</h1>
                                <p className="text-sm text-gray-600 mb-6"><strong>Effective Date:</strong> October 19, 2025</p>
                                
                                <p className="text-gray-700 mb-4">
                                    This Comprehensive Privacy Policy describes how BaraKollect ("we," "us," or "our"), a web-based platform for Liberica coffee bean analysis, collects, uses, retains, and shares information from Farmers, Researchers, and other users (collectively, "Users" or "you").
                                </p>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Information We Collect</h2>
                                <p className="text-gray-700 mb-4">
                                    We collect information necessary to achieve the platform's specific research and operational objectives: establishing a data repository, implementing morphological analysis, and providing analytical and GIS insights.
                                </p>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">1.1 Personal Data (Identification and Contact)</h3>
                                <p className="text-gray-700 mb-3">
                                    This data is collected strictly for user authentication, authorized communication, and responsible data attribution.
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li><strong>Farmer Data:</strong> Full Name, preferred Contact Information (email address, phone number), and Farm or Cooperative Name.</li>
                                    <li><strong>Researcher/Analyst Data:</strong> Full Name, Institutional Affiliation, and Institutional Contact Information (email address).</li>
                                    <li><strong>Authentication Data:</strong> Encrypted credentials and unique user IDs generated upon registration.</li>
                                </ul>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">1.2 Coffee Bean and Farm Data (Core Platform Repository)</h3>
                                <p className="text-gray-700 mb-3">
                                    This data forms the digital repository and is the foundation of the Service (Objective 1.1, 1.2).
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li><strong>Morphological Data (Raw):</strong> High-resolution images of Liberica coffee beans uploaded by Farmers.</li>
                                    <li><strong>Farm Metadata:</strong> Detailed data from Farmers, including but not limited to: harvest date, processing method (e.g., washed, natural), varietal notes, and environmental observations.</li>
                                </ul>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">1.3 Derived Analytical Data (Platform Content)</h3>
                                <p className="text-gray-700 mb-3">
                                    This data is generated by the Service based on the Core Platform Data and constitutes the analytical product (Objective 2.1, 2.2, 3.2).
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li><strong>Extracted Features:</strong> Quantitative data derived from images via computer vision algorithms (e.g., shape metrics, length, width, area, color profiles, and automated classification results).</li>
                                    <li><strong>Aggregated Metrics:</strong> Statistical summaries, trends, and correlation patterns visualized in the interactive dashboard (Objective 3.1).</li>
                                </ul>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">1.4 Location Data (GIS Feature)</h3>
                                <p className="text-gray-700 mb-4">
                                    <strong>Farm Location (Sensitive):</strong> Specific GPS coordinates (latitude/longitude) or precise geographical identifiers collected from Farmers, used exclusively for the GIS Visualization and Monitoring Objectives (Objective 4.1, 4.2).
                                </p>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">1.5 Technical and Usage Data (Operational)</h3>
                                <p className="text-gray-700 mb-3">
                                    When you access the Service, we automatically collect data related to your device and usage, which helps us maintain and improve the platform. This includes:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li>Internet Protocol (IP) address, browser type, operating system.</li>
                                    <li>Usage statistics, access times, and pages viewed.</li>
                                    <li>Error logs and system performance data.</li>
                                </ul>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. How We Use Your Information</h2>
                                <p className="text-gray-700 mb-3">
                                    We use the collected data exclusively to fulfill the platform's stated General and Specific Objectives:
                                </p>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li><strong>Service Operation and Security:</strong> To operate, secure, and maintain the BaraKollect platform, including user authentication and encrypted data storage (Objective 1.2).</li>
                                    <li><strong>Core Data Processing:</strong> To establish, maintain, and structure the digital repository, and to feed images to the computer vision system for feature extraction and classification (Objective 2.2).</li>
                                    <li><strong>Research & Analysis:</strong> To power the interactive dashboard, visualize trends, identify correlations, and generate location-specific insights (Objective 3.2, 4.2).</li>
                                    <li><strong>System Improvement:</strong> To monitor performance, debug issues, and refine the computer vision and analytical models.</li>
                                </ul>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. How We Share and Disclose Data</h2>
                                <p className="text-gray-700 mb-4">
                                    Data sharing is integral to the research and collaborative mission of BaraKollect. It is conducted under a strict framework designed to maximize scientific utility while upholding privacy.
                                </p>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">3.1 Sharing of Personal vs. Repository Data</h3>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li><strong>Personal Data (Names, Emails, Phone Numbers):</strong> Raw personal data will NOT be shared with Researchers or the public. Access is restricted to platform administrators for administrative, authentication, and communication purposes.</li>
                                    <li><strong>Repository Data (Shared):</strong> Researchers will have access to the Aggregated Morphological Data, Extracted Features, and Anonymous GIS data.</li>
                                </ul>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">3.2 Data Anonymization and Aggregation Protocol</h3>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li><strong>Anonymization of Location:</strong> Farm GPS coordinates are aggregated and visualized on public-facing GIS views using generalized area markers (e.g., town or barangay level) or clustering to prevent the identification of specific farm boundaries (Objective 4.1).</li>
                                    <li><strong>Non-Personal Identifiers (NPIs):</strong> All shared repository data will be tagged with NPIs (e.g., "Farm ID 001," "Batangas Region X Contributor") to maintain traceability and attribution without revealing direct personal identities.</li>
                                </ul>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">3.3 Attribution and Consent</h3>
                                <p className="text-gray-700 mb-4">
                                    Farmer contributions will be accurately recorded internally. Attribution in any public or academic output will use the NPIs unless the Farmer provides explicit, written consent to the BaraKollect administration team to use their name, institutional affiliation, or specific farm name.
                                </p>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">3.4 Legal Requirements</h3>
                                <p className="text-gray-700 mb-4">
                                    We may disclose your information if required by local or international law, court order, or governmental regulation, or in the good faith belief that such action is necessary to protect our rights, property, or the safety of our Users or the public.
                                </p>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Data Storage, Security, and Retention</h2>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">4.1 Data Storage Location and Security</h3>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li><strong>Storage Location:</strong> All data (Personal, Core, Derived, and Location) will be stored securely within a structured, encrypted database infrastructure (Objective 1.2).</li>
                                    <li><strong>Security Measures:</strong> We implement industry-standard security measures, including data encryption (in transit and at rest), strict access controls based on user roles (Farmer/Researcher/Admin), and regular security audits and backups to protect data from unauthorized access, loss, or damage.</li>
                                </ul>

                                <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">4.2 Data Retention Policy</h3>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li><strong>Personal Data:</strong> Identification and contact data will be retained for as long as the User's account is active and for a mandatory administrative period (e.g., 24 months) following account deactivation, to meet legal or auditing requirements.</li>
                                    <li><strong>Core and Derived Data (Research Repository):</strong> Since the primary goal of the Service is to build a long-term research repository, the anonymized and aggregated coffee bean data, images, and derived features will be retained indefinitely to support longitudinal studies and historical quality assessment.</li>
                                </ul>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Your Rights and Choices</h2>
                                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                                    <li><strong>Access and Correction:</strong> You have the right to request access to the specific personal data we hold about you and request corrections to any inaccuracies via the Contact Us section.</li>
                                    <li><strong>Data Withdrawal (Farmers):</strong> Farmers may request the withdrawal of their non-aggregated personal data and original images from the active repository. We will make reasonable efforts to comply; however, data that has already been aggregated, anonymized, and incorporated into historical research datasets or trained into machine learning models may not be entirely removed from these immutable historical records. No further use of the raw data will be made upon withdrawal.</li>
                                </ul>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Changes to this Privacy Policy</h2>
                                <p className="text-gray-700 mb-4">
                                    We may update this Privacy Policy periodically to reflect changes in our practices or objectives. We will notify you of any material changes by posting the new Policy on this page and updating the "Effective Date" at the top. Your continued use of the Service constitutes your acceptance of the revised Policy.
                                </p>

                                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Contact Us</h2>
                                <p className="text-gray-700">
                                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data handling practices, please contact the BaraKollect administration team.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


