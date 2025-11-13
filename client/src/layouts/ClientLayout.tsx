import { useEffect, useState } from "react";
import SideBar from '../components/SideBar';
import NavBar from '../components/NavBar';
import '../assets/styles/global.css';
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo1 from "@/assets/images/barakollect_logo.svg";
import logo2 from "@/assets/images/logo.svg";
import GlassSurface from "@/components/GlassSurface";

export default function ClientLayout() {
  const [showSideBar, setShowSideBar] = useState<boolean>(true);
  const [isTabletUp, setIsTabletUp] = useState<boolean>(false);
  const { user, role, loading } = useAuth();
  const logo: string[] = [logo1, logo2];

  useEffect(() => {
    const evaluateViewport = () => {
      const matches = window.innerWidth >= 1024;
      setIsTabletUp(matches);
      if (!matches) {
        setShowSideBar(false);
      }
    };

    evaluateViewport();
    window.addEventListener("resize", evaluateViewport);
    return () => window.removeEventListener("resize", evaluateViewport);
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const shouldUseOverlay = !isTabletUp;
  const sidebarVisible = showSideBar || isTabletUp;

  return (
  <div className="relative flex flex-col h-screen">
      {/* Glass Nav */}
      <div className="absolute top-0 left-0 w-full z-50">
        <GlassSurface 
          width="100%" 
          backgroundOpacity={0.7}
          borderRadius={0} 
          displace={5}
          redOffset={40}
          blueOffset={10}
          greenOffset={20}
          blur={20}
          brightness={50}
          saturation={1.3}
          distortionScale={-200}
        >
          <NavBar logo={logo} showSideBar={showSideBar} setShowSideBar={setShowSideBar} role={role} />
        </GlassSurface>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 h-full overflow-hidden">
        <div
          className={`pt-[70px] h-full overflow-y-auto transition-transform duration-300 ease-in-out ${shouldUseOverlay ? "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl" : "relative flex-shrink-0"} ${shouldUseOverlay && !sidebarVisible ? "-translate-x-full" : "translate-x-0"}`}
        >
          <SideBar show={isTabletUp ? showSideBar : true} role={role} user={user} />
        </div>

        {shouldUseOverlay && sidebarVisible && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setShowSideBar(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}

        <div className="flex-1 pt-[64px] overflow-y-auto text-black bg-[var(--mocha-beige)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
