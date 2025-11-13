import ClientLayout from "./../layouts/ClientLayout";
import { Route, Routes } from "react-router-dom";
import Home from "./../pages/Home";
import Login from "./../pages/Login";
import Signup from "@/pages/Signup";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "./../pages/NotFound";
import ResearcherDashboard from "@/pages/researcher/ResearcherDashboard";
import UploadSamples from "@/components/UploadSamples";
import ValidationQueue from "@/pages/researcher/ValidationQueue";
import FarmMap from "@/pages/researcher/FarmMap";
import BeansGallery from "@/pages/researcher/BeansGallery";
import Analytics from "@/pages/researcher/Analytics";
import Notifications from "@/pages/farmer/Notifications";
import AdminLayout from "@/layouts/AdminLayout";
import FarmerDashboard from "@/pages/farmer/FarmerDashboard";
import FarmerBeansGallery from "@/pages/farmer/FarmerBeansGallery";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import SystemMonitoring from "@/pages/admin/SystemMonitoring";
import ActivityLogs from "@/pages/admin/ActivityLogs";
import Settings from "@/pages/admin/Settings";
import FarmerSettings from "@/pages/farmer/Settings";
import ResearcherSettings from "@/pages/researcher/Settings";
import AdminBeansGallery from "../components/AdminBeansGallery";
import AdminBeansMetadata from "@/components/AdminBeansMetadata";
import AdminFarmMap from "@/pages/admin/AdminFarmMap";

import TestEnhancedGallery from "@/pages/TestEnhancedGallery";
import Annotations from "@/pages/researcher/Annotations";


export default function AppRoute() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />}>
            </Route>
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/researcher" element={<ClientLayout /> }>
                <Route path="dashboard" element={<ResearcherDashboard />} />
                <Route path="upload-image" element={<UploadSamples />} />
                <Route path="gallery" element={<BeansGallery />} />
                <Route path="test-enhanced" element={<TestEnhancedGallery />} />
                <Route path="annotations" element={<Annotations />} />
                <Route path="validation" element={<ValidationQueue />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="farm-map" element={<FarmMap />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<ResearcherSettings />} />
            </Route>
            <Route path="/farmer" element={<ClientLayout />}> 
                <Route path="dashboard" element={<FarmerDashboard />} />
                <Route path="upload-image" element={<UploadSamples />} />
                <Route path="gallery" element={<FarmerBeansGallery />} />
                <Route path="farm-map" element={<FarmMap />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<FarmerSettings />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}> 
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="user-management" element={<UserManagement />} />
                <Route path="monitoring" element={<SystemMonitoring />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
                <Route path="gallery" element={<AdminBeansGallery />} />
                <Route path="farm-map" element={<AdminFarmMap />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
                <Route path="metadata" element={<AdminBeansMetadata />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}