import { useState } from "react";
import SideBar from '../components/SideBar'
import NavBar from '../components/NavBar'
import '../assets/styles/global.css'
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo1 from "@/assets/images/barakollect_logo.svg";
import logo2 from "@/assets/images/logo.svg";
import GlassSurface from "@/components/GlassSurface";

export default function AdminLayout() {
  const [showSideBar, setShowSideBar] = useState<boolean>(true);
  const { user, role, loading } = useAuth();
  const logo: string[] = [
    logo1,
    logo2
  ];

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="relative flex flex-col h-screen">
      {/* Glass Nav */}
      <div className="absolute top-0 left-0 w-full z-50">
        <GlassSurface 
          width="100%" 
          backgroundOpacity={0.5}
          borderRadius={0} 
          displace={5}
          redOffset={40}
          blueOffset={10}
          greenOffset={20}
          blur={20}
          brightness={50}
          saturation={1.5}
          distortionScale={-200}
        >
          <NavBar logo={logo} showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
        </GlassSurface>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 h-full">
        <div className="pt-[70px]">
          <SideBar show={showSideBar} role={role} user={user} />
        </div>
        <div className="flex-1 pt-[64px] overflow-y-auto text-black">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
