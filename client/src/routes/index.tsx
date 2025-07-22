import ClientLayout from "./../layouts/ClientLayout";
import { Route, Routes } from "react-router-dom";
import Home from "./../pages/Home";
import Login from "./../pages/Login";
import NotFound from "./../pages/NotFound";

export default function AppRoute() {
    return (
        <Routes>
            <Route path="/" element={<ClientLayout />}>
                <Route path="dashboard" element={<Home />} />
                <Route path="upload-image" element={<Login />} />
                <Route path="gallery" element={<Home />} />
                <Route path="farm-map" element={<Login />} />
                <Route path="notifications" element={<Home />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}