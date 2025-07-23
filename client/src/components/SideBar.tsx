import { BellIcon, ImageIcon, LayoutDashboard, LogOutIcon, MapPin, PersonStandingIcon, ScanFaceIcon, UploadIcon } from "lucide-react";
import { Link } from "react-router-dom";
interface User {
    name: string,
    role: string
}
interface NavItems {
    icon: React.ReactNode,
    label: string,
    route?: string,
    active?: boolean
}

const SideBar = ({ show }: { show: boolean }) => {
    const user: User = {
        name: "Cy Fetizananana",
        role: "Farmer"
    }
    const navigationItems: NavItems[] = [
        {
            icon: (<LayoutDashboard />),
            label: "Dashboard",
            route: "/dashboard",
            active: true,
        },
        {
            icon: (<UploadIcon />),
            label: "Upload Images",
            route: "/upload-image"
        },
        {
            icon: (<ImageIcon />),
            label: "Beans Gallery",
            route: "/gallery"
        },
        {
            icon: (<MapPin />),
            label: "Farm Map",
            route: "/farm-map"
        },
        {
            icon: (<BellIcon />),
            label: "Notifications",
            route: "/notifications"
        }
    ];

    return (
        <div className={`sideNav ${show ? "expanded" : "collapsed"}`}>

            <div >

                <div className={`userInfo ${show ? "" : "collapsed"}`}>
                    <div className={`userAvatarImg ${show ? "" : "collapsed"}`}>
                        <ScanFaceIcon className="userAvatar" />
                        {/* <img src="/src/assets/react.svg" alt="User Avatar" className="userAvatar" /> */}
                    </div>
                    {show && (
                        <div className="userDetails">
                            <p className="userName">{user.name}</p>
                            <p className="userRole">{user.role}</p>
                        </div>
                    )}
                </div>

                <div className="midSection">
                    <div className="Nav">
                        <ul>
                            {!show
                                ?
                                navigationItems.map((item, index) => (
                                    <Link to={`${item.route}`} className={`navigationBtn ${show ? "" : "collapsed"} ${item.active ? "active" : ""}`} key={index}
                                        onMouseOver={(e) => {
                                            const lblNav = e.currentTarget.querySelector(".lblNav") as HTMLElement;
                                            if (lblNav) lblNav.style.display = "block";
                                        }}
                                        onMouseLeave={(e) => {
                                            const lblNav = e.currentTarget.querySelector(".lblNav") as HTMLElement;
                                            if (lblNav) lblNav.style.display = "none";
                                        }}>
                                        <a>
                                            <span className="icon">{item.icon}</span>
                                            <span className={`lblNav ${show ? "" : "collapsed"}`}>{item.label}</span>
                                        </a>
                                    </Link>
                                ))
                                :
                                navigationItems.map((item, index) => (
                                    <Link to={`${item.route}`} className={`navigationBtn ${show ? "" : "collapsed"} ${item.active ? "active" : ""}`} key={index}
                                    >
                                        <a>
                                            <span className="icon">{item.icon}</span>
                                            <span className={`lblNav`} style={{display:"block"}}>{item.label}</span>
                                        </a>
                                    </Link>
                                ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bottomSection">
                <ul>
                    <li className={`navigationBtn ${show ? "" : "collapsed"}`}>
                        <a href="/">
                            <LogOutIcon />
                            {<span className={`lblNav ${show ? "" : "collapsed"}`}>Logout</span>}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SideBar;