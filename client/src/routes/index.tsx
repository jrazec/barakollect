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


export default function AppRoute() {
    return (
        <Routes>
            <Route path="/login" element={<Login />}>
            </Route>
            <Route path="/researcher" element={<ClientLayout />}>
                <Route path="dashboard" element={<ResearcherDashboard />} />
                <Route path="upload-image" element={<UploadSamples />} />
                <Route path="gallery" element={<BeansGallery />} />
                <Route path="validation" element={<ValidationQueue />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="farm-map" element={<FarmMap />} />
                <Route path="notifications" element={<Notifications />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}