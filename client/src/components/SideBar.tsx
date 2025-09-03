import type { NavItems, User } from "@/interfaces/global";
import { ActivityIcon, BellIcon, ChartBar, ImageIcon, LayoutDashboard, LogOutIcon, MapPin, Monitor, ScanFaceIcon, Settings, UploadIcon, User2Icon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";


const SideBar = ({ show, role, user }: { show: boolean, role: string, user: User }) => {
    const location = useLocation();
    const navigationItems: Record<string, NavItems[]> = {

        farmer: [
            {
                icon: (<LayoutDashboard />),
                label: "Dashboard",
                route: "/farmer/dashboard",
                active: true,
            },
            {
                icon: (<UploadIcon />),
                label: "Upload Images",
                route: "/farmer/upload-image"
            },
            {
                icon: (<ImageIcon />),
                label: "Beans Gallery",
                route: "/farmer/gallery"
            },
            {
                icon: (<MapPin />),
                label: "Farm Map",
                route: "/farmer/farm-map"
            },
            {
                icon: (<BellIcon />),
                label: "Notifications",
                route: "/farmer/notifications"
            }
        ],
        researcher: [
            {
                icon: (<LayoutDashboard />),
                label: "Dashboard",
                route: "/researcher/dashboard",
                active: true,
            },
            {
                icon: (<ChartBar />),
                label: "Analytics",
                route: "/researcher/analytics",

            },
            {
                icon: (<UploadIcon />),
                label: "Upload Images",
                route: "/researcher/upload-image"
            },
            {
                icon: (<ImageIcon />),
                label: "Beans Gallery",
                route: "/researcher/gallery"
            },
            {
                icon: (<MapPin />),
                label: "Farm Map",
                route: "/researcher/farm-map"
            },
            {
                icon: (<BellIcon />),
                label: "Notifications",
                route: "/researcher/notifications"
            }
        ],
        admin: [
            {
                icon: (<LayoutDashboard />),
                label: "Dashboard",
                route: "/admin/dashboard",
                active: true,
            },
            {
                icon: (<User2Icon />),
                label: "User Management",
                route: "/admin/user-management"
            },
            {
                icon: (<MapPin />),
                label: "Farm Management",
                route: "/admin/farm-map"
            },
            {
                icon: (<Monitor />),
                label: "System Monitor",
                route: "/admin/monitoring"
            },
            {
                icon: (<ActivityIcon />),
                label: "Activity Logs",
                route: "/admin/activity-logs"
            },
            {
                icon: (<BellIcon />),
                label: "Notifications",
                route: "/admin/notifications"
            },
            {
                icon: (<Settings />),
                label: "Settings",
                route: "/admin/settings"
            }
        ]
    };



    const { signOut } = useAuth();

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
                                navigationItems[role].map((item, index) => (
                                    <Link to={`${item.route}`} className={`navigationBtn ${show ? "" : "collapsed"} ${item.route === location.pathname ? "active" : ""}`} key={index}
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
                                navigationItems[role].map((item, index) => (
                                    <Link to={`${item.route}`} className={`navigationBtn ${show ? "" : "collapsed"} ${item.route === location.pathname ? "active" : ""}`} key={index}
                                    >
                                        <a>
                                            <span className="icon">{item.icon}</span>
                                            <span className={`lblNav`} style={{ display: "block" }}>{item.label}</span>
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
                        <button onClick={signOut} className="w-full text-left">
                            <span className="icon"><LogOutIcon /></span>
                            {<span className={`lblNav ${show ? "" : "collapsed"}`}>Logout</span>}
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SideBar;