import { useState } from "react";
import SideBar from '../components/SideBar'
import NavBar from '../components/NavBar'
import '../assets/styles/global.css'
export default function ClientLayout() {
  const [showSideBar, setShowSideBar] = useState<boolean>(true);
  const logo: string[] = [
    "/src/assets/images/barakollect_logo.svg",
    "/src/assets/images/logo.svg"
  ];
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0">
        <NavBar logo={logo} showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
      </div>
      <div className="flex flex-1 overflow-auto">
        <SideBar show={showSideBar} />
        <div className="flex-column text-white w-full h-full">
          BODY
        </div>
      </div>
    </div>
  );
}