import { ArrowRightFromLine, PanelLeftClose, BellIcon } from "lucide-react"
import { Link } from "react-router-dom"

const NavBar = ({showSideBar,setShowSideBar, logo, role}:{showSideBar:boolean,setShowSideBar:Function,logo:string[],role:string}) => {
   const getNotificationsRoute = () => {
     return `/${role}/notifications`;
   };

   return (
     <nav className="headerNav pl-2 w-full z-10 flex justify-between items-center">
        <div className="flex items-center">
            <div className="logoSection">
                <div className={`logo ${showSideBar ? "" : "collapsed"} cursor-pointer`}>
                    <img src={logo[showSideBar ? 0 : 1]} alt="logo" onClick={() => showSideBar ? "" : setShowSideBar(!showSideBar)} />
                </div>
                <div className={`minimize ${showSideBar ? "" : "collapsed"} cursor-pointer`} onClick={() => setShowSideBar(!showSideBar)}>
                    <div className=" glass-hover text-gray-700 p-1 transition-colors duration-200 rounded-md">
                        {showSideBar ? <PanelLeftClose /> : <ArrowRightFromLine />}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-4 pr-4">
            <Link 
                to={getNotificationsRoute()}
                className="p-2 glass-hover hover:bg-gray-100 hover:!text-[var(--arabica-brown)] hover:scale-105 rounded-lg transition-colors duration-200 flex items-center justify-center relative"
                onMouseOver={(e) => {
                    const tooltip = e.currentTarget.querySelector(".notification-tooltip") as HTMLElement;
                    if (tooltip) {
                        tooltip.style.display = "block";
                        setTimeout(() => {
                            tooltip.style.opacity = "1";
                        }, 10);
                    }
                }}
                onMouseLeave={(e) => {
                    const tooltip = e.currentTarget.querySelector(".notification-tooltip") as HTMLElement;
                    if (tooltip) {
                        tooltip.style.opacity = "0";
                        setTimeout(() => {
                            tooltip.style.display = "none";
                        }, 200);
                    }
                }}
            >
                <BellIcon className="w-5 h-5 text-gray-700" />
                <span className="notification-tooltip" style={{ 
                    position: 'absolute',
                    fontFamily: 'var(--font-main)',
                    padding: '0.7rem',
                    right: '3.5rem',
                    borderRadius: '2rem',
                    fontSize: '0.8rem',
                    display: 'none',
                    opacity: 0,
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                    border: '1px solid var(--fadin-gray)',
                    color: 'var(--gray)',
                    transition: 'opacity 0.2s ease-in-out'
                }}>Notifications</span>
            </Link>
        </div>
    </nav>
   );
}
export default NavBar;