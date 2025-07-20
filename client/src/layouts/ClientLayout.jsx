import SideBar from '../components/SideBar'
import '../assets/styles/global.css'
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from 'react';

export default function ClientLayout() {
  const [showSideBar, setShowSideBar] = useState(true);

  return (
    <div className="App">
      <header>
        <GiHamburgerMenu onClick={() => setShowSideBar(prev => !prev)} style={{ cursor: "pointer" }} />
      </header>
      <SideBar show={showSideBar} />
    </div>
  );
}
