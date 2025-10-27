import { ArrowLeftIcon, ArrowRightFromLine, PanelLeftClose} from "lucide-react"

const NavBar = ({showSideBar,setShowSideBar, logo}:{showSideBar:boolean,setShowSideBar:Function,logo:string[]}) => {
   return (
     <nav className="headerNav text-white pl-4 w-full z-10 flex justify-between items-center">
        <div className="flex items-center">
            <div className="logoSection">
                <div className={`logo ${showSideBar ? "" : "collapsed"} cursor-pointer`}>
                    <img src={logo[showSideBar ? 0 : 1]} alt="logo" onClick={() => showSideBar ? "" : setShowSideBar(!showSideBar)} />
                </div>
                <div className={`minimize ${showSideBar ? "" : "collapsed"} cursor-pointer`} onClick={() => setShowSideBar(!showSideBar)}>
                    <div className="bg-white text-gray-700 p-1 rounded-md">
                        {showSideBar ? <PanelLeftClose /> : ""}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-4">

        </div>
    </nav>
   );
}
export default NavBar;