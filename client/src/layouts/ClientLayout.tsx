import { useState } from "react";
import SideBar from '../components/SideBar'
import NavBar from '../components/NavBar'
import '../assets/styles/global.css'
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo1 from "@/assets/images/barakollect_logo.svg";
import logo2 from "@/assets/images/logo.svg";

export default function ClientLayout() {
  const [showSideBar, setShowSideBar] = useState<boolean>(true);
  const { user, role, loading } = useAuth();
  const logo: string[] = [
    logo1,
    logo2
  ];
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0">
        <NavBar logo={logo} showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
      </div>
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        {/* flex-column text-white w-full h-full overflow-y-scroll bg-[var(--mocha-beige)] */}
        <SideBar show={showSideBar} role={role} user={user} />
        <div className="flex-1 h-full overflow-y-auto text-black">
          <Outlet />
        </div>
      </div>
    </div>
  );
}