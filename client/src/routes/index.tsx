import ClientLayout from "./../layouts/ClientLayout";
import { Route, Routes } from "react-router-dom";
import Home from "./../pages/Home";
import Login from "./../pages/Login";
import NotFound from "./../pages/NotFound";
import ResearcherDashboard from '../pages/researcher/ResearcherDashboard'
import UploadSamples from "@/components/UploadSamples";
import ValidationQueue from "@/pages/researcher/ValidationQueue";
import FarmMap from "@/pages/researcher/FarmMap";
import BeansGallery from "@/pages/researcher/BeansGallery";
import Analytics from "@/pages/researcher/Analytics";
import Notifications from "@/pages/farmer/Notifications";
import AdminLayout from "@/layouts/AdminLayout";
import FarmerDashboard from "@/pages/farmer/FarmerDashboard";
import FarmerBeansGallery from "@/pages/farmer/FarmerBeansGallery";


export default function AppRoute() {
    return (
        <Routes>
            <Route path="/login" element={<Login />}>
            </Route>
            <Route path="/researcher" element={<ClientLayout /> }>
                <Route path="dashboard" element={<ResearcherDashboard />} />
                <Route path="upload-image" element={<UploadSamples />} />
                <Route path="gallery" element={<BeansGallery />} />
                <Route path="validation" element={<ValidationQueue />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="farm-map" element={<FarmMap />} />
                <Route path="notifications" element={<Notifications />} />
            </Route>
            <Route path="/farmer" element={<ClientLayout />}> 
                <Route path="dashboard" element={<FarmerDashboard />} />
                <Route path="upload-image" element={<UploadSamples />} />
                <Route path="gallery" element={<FarmerBeansGallery />} />
                <Route path="farm-map" element={<FarmMap />} />
                <Route path="notifications" element={<Notifications />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}> 
                {/* AdminDashboard */}
                <Route path="dashboard" element={<ResearcherDashboard />} />
                {/* User Management */}
                <Route path="user-management" element={<UploadSamples />} />
                {/* System Monitor */}
                <Route path="monitoring" element={<BeansGallery />} />
                {/* Activity Logs */}
                <Route path="activity-logs" element={<ValidationQueue />} />
                {/* Notifications */}
                <Route path="notifications" element={<Notifications />} />
                {/* Settings */}
                <Route path="settings" element={<Notifications />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}